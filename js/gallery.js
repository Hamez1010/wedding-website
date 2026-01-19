import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const galleryGrid = document.querySelector('.gallery-grid');

// Optional: Clear existing static images if you only want dynamic content
// galleryGrid.innerHTML = ''; 

async function loadGallery() {
    try {
        const q = query(
            collection(db, "photos"),
            where("status", "==", "approved"),
            orderBy("uploadedAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        // If no photos yet, show a message
        if (querySnapshot.empty) {
            console.log("Check back after the wedding for photos.");
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = "Check back after the wedding for guest photos.";
            emptyMsg.style.textAlign = "center";
            emptyMsg.style.gridColumn = "1 / -1"; // Span all columns
            emptyMsg.style.color = "white";
            galleryGrid.appendChild(emptyMsg);
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const img = document.createElement('img');
            img.src = data.url;
            img.alt = `Photo by ${data.uploader || 'Guest'}`;
            img.loading = "lazy"; // Good for performance

            // Optional: Add lightbox click handler here similar to admin
            img.onclick = () => {
                // specific lightbox logic if desired, or simple new tab
                window.open(data.url, '_blank');
            };

            galleryGrid.appendChild(img);
        });

    } catch (error) {
        console.error("Error loading gallery:", error);
        // User-facing error handling for missing index
        if (error.message.includes("indexes?create_composite=")) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = "red";
            errorDiv.style.padding = "20px";
            errorDiv.style.textAlign = "center";
            errorDiv.innerHTML = `
                <p><strong>Admin Action Required:</strong> A Firestore Index is missing.</p>
                <p><a href="${error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)[0]}" target="_blank" style="text-decoration:underline;">Click here to create the index</a></p>
                <p>Status: ${error.message}</p>
            `;
            if (galleryGrid) galleryGrid.before(errorDiv);
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = "red";
            errorDiv.style.textAlign = "center";
            errorDiv.textContent = "Error loading photos. Please check the console.";
            if (galleryGrid) galleryGrid.before(errorDiv);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadGallery);
