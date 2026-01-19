import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadPhotos();
    }
});

document.getElementById('logout-link').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
});

async function loadPhotos() {
    const pendingGrid = document.getElementById('pending-grid');
    const approvedGrid = document.getElementById('approved-grid');
    const pendingCount = document.getElementById('pending-count');
    const loading = document.getElementById('loading');

    pendingGrid.innerHTML = '';
    approvedGrid.innerHTML = '';

    try {
        const q = query(collection(db, "photos"), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(q);

        loading.style.display = 'none';

        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = createPhotoCard(doc.id, data);

            if (data.status === 'pending') {
                pendingGrid.appendChild(card);
                count++;
            } else if (data.status === 'approved') {
                // Only show 'Actions' for approved if needed (maybe delete)
                // For now let's just show them without approve button
                const approvedCard = createPhotoCard(doc.id, data, true);
                approvedGrid.appendChild(approvedCard);
            }
        });

        pendingCount.textContent = `${count} Pending`;

    } catch (error) {
        console.error("Error loading photos:", error);
        loading.textContent = "Error loading photos. Check console.";
    }
}

function createPhotoCard(id, data, isApproved = false) {
    const div = document.createElement('div');
    div.className = 'photo-card';

    const img = document.createElement('img');
    img.src = data.url;
    img.onclick = () => openModal(data.url);

    const info = document.createElement('div');
    info.className = 'photo-info';
    const date = data.uploadedAt ? new Date(data.uploadedAt.seconds * 1000).toLocaleDateString() : 'N/A';
    info.innerHTML = `<strong>Uploaded by:</strong> ${data.uploader || 'Anonymous'}<br>
                    <strong>Date:</strong> ${date}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deletePhoto(id, data.url);

    actions.appendChild(deleteBtn);

    if (!isApproved) {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn btn-approve';
        approveBtn.textContent = 'Approve';
        approveBtn.onclick = () => approvePhoto(id);
        actions.appendChild(approveBtn); // Approve first
        actions.appendChild(deleteBtn);
    } else {
        actions.appendChild(deleteBtn);
    }

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(actions);

    return div;
}

// Modal Logic
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById("img01");
const span = document.getElementsByClassName("close")[0];

function openModal(src) {
    modal.style.display = "block";
    modalImg.src = src;
}

span.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Actions
async function approvePhoto(id) {
    if (!confirm("Approve this photo?")) return;
    try {
        const photoRef = doc(db, "photos", id);
        await updateDoc(photoRef, {
            status: "approved"
        });
        loadPhotos(); // Refresh
    } catch (error) {
        console.error("Error approving:", error);
        alert("Error approving photo");
    }
}

async function deletePhoto(id, url) {
    if (!confirm("Are you sure you want to permanently delete this photo?")) return;
    try {
        // 1. Delete from Firestore
        await deleteDoc(doc(db, "photos", id));

        // 2. Try to delete from Storage (optional, but good for cleanup)
        // We need to reconstruct the ref from the URL or just skip if too complex for now
        // Actually, let's try to get a reference from the URL
        try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
        } catch (e) {
            console.warn("Could not delete file from storage (might already be gone or permission issue):", e);
        }

        loadPhotos();
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Error deleting photo");
    }
}
