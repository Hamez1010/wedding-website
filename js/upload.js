import { db, storage } from './firebase-config.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const fileList = document.getElementById('file-list');
const submitBtn = document.getElementById('submit-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const statusMessage = document.getElementById('status-message');

let selectedFiles = [];

// Grab theme highlight from CSS variables (falls back to a hex if not set)
const _cssHighlight = getComputedStyle(document.documentElement).getPropertyValue('--highlight') || '#DCA1A1';
const highlightColor = _cssHighlight.trim() || '#DCA1A1';

// Drag and drop handlers
dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = highlightColor;
    dropArea.style.backgroundColor = '#fcfcfc';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#ddd';
    dropArea.style.backgroundColor = 'transparent';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#ddd';
    dropArea.style.backgroundColor = 'transparent';
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (selectedFiles.length + newFiles.length > 5) {
        alert("You can only upload a maximum of 5 photos at a time.");
        return;
    }

    selectedFiles = [...selectedFiles, ...newFiles];
    updateFileList();
    updateSubmitButton();
}

function updateFileList() {
    fileList.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
      <span>${file.name}</span>
      <span style="cursor:pointer; color:red;" onclick="removeFile(${index})">×</span>
    `;
        fileList.appendChild(item);
    });

    // Attach handlers dynamically helper - actually inline onclick is tricky with modules
    // So we'll delegate event
}

// Global scope hack for inline onclick, or better, event delegation
window.removeFile = (index) => {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateSubmitButton();
};

function updateSubmitButton() {
    submitBtn.disabled = selectedFiles.length === 0;
    if (selectedFiles.length > 0) {
        submitBtn.textContent = `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`;
    } else {
        submitBtn.textContent = "Upload Photos";
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const uploaderName = document.getElementById('uploader-name').value || 'Anonymous';

    submitBtn.disabled = true;
    progressContainer.style.display = 'block';
    statusMessage.textContent = 'Starting upload...';

    let completed = 0;
    let total = selectedFiles.length;

    try {
        for (const file of selectedFiles) {
            // Create a unique filename: timestamp_random_filename
            const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
            const storageRef = ref(storage, `guest_uploads/${filename}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Optional: distinct progress per file
                    },
                    (error) => {
                        console.error("Upload failed:", error);
                        reject(error);
                    },
                    async () => {
                        // Upload complete
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        // Save to Firestore
                        await addDoc(collection(db, "photos"), {
                            url: downloadURL,
                            status: "pending",
                            uploadedAt: serverTimestamp(),
                            uploader: uploaderName,
                            originalName: file.name
                        });

                        completed++;
                        const percent = (completed / total) * 100;
                        progressFill.style.width = `${percent}%`;
                        resolve();
                    }
                );
            });
        }

        statusMessage.textContent = "Thank you! Your photos have been uploaded and will be visible after approval.";
        statusMessage.style.color = "green";
        selectedFiles = [];
        updateFileList();
        form.reset();
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
            updateSubmitButton();
        }, 5000);

    } catch (error) {
        console.error("Error uploading:", error);
        statusMessage.textContent = "Something went wrong. Please try again.";
        statusMessage.style.color = "red";
        submitBtn.disabled = false;
    }
});
