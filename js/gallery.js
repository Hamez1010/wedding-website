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

        // If no photos yet, maybe show a message or just leave it
        if (querySnapshot.empty) {
            // console.log("No approved photos yet.");
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
    }
}

document.addEventListener('DOMContentLoaded', loadGallery);
