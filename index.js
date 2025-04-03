// This code should be added to your photography-portfolio.html file before the closing </body> tag

<script>
// DOM Elements
const uploadForm = document.querySelector('#upload form');
const uploadArea = document.querySelector('.upload-area');
const galleryContainer = document.querySelector('.gallery');
const categoryButtons = document.querySelectorAll('.category-btn');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.name = 'photo';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';

// Load photos when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
});

// Handle category filtering
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const category = button.textContent === 'All' ? '' : button.textContent.toLowerCase();
        loadPhotos(category);
    });
});

// Handle drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ff5e3a';
    uploadArea.style.backgroundColor = 'rgba(255,94,58,0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#f8f9fa';
    uploadArea.style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#f8f9fa';
    uploadArea.style.backgroundColor = 'transparent';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        // Display file name
        const fileName = e.dataTransfer.files[0].name;
        uploadArea.querySelector('p').textContent = `Selected file: ${fileName}`;
    }
});

// Click to select file
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        // Display file name
        const fileName = fileInput.files[0].name;
        uploadArea.querySelector('p').textContent = `Selected file: ${fileName}`;
    }
});

// Handle form submission
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if file is selected
    if (!fileInput.files.length) {
        alert('Please select a file to upload');
        return;
    }
    
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    
    // Show loading state
    const submitBtn = uploadForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Uploading...';
    submitBtn.disabled = true;
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Reset form
        uploadForm.reset();
        uploadArea.querySelector('p').textContent = 'Drag and drop files here or click to browse';
        
        // Show success message
        alert('Photo uploaded successfully!');
        
        // Reload photos
        loadPhotos();
    })
    .catch(error => {
        alert(`Error uploading photo: ${error.message}`);
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Function to load photos
function loadPhotos(category = '') {
    // Construct API URL
    const url = category ? `/api/photos?category=${category}` : '/api/photos';
    
    fetch(url)
        .then(response => response.json())
        .then(photos => {
            // Clear existing gallery
            galleryContainer.innerHTML = '';
            
            // If no photos, show message
            if (photos.length === 0) {
                const noPhotosMsg = document.createElement('div');
                noPhotosMsg.className = 'no-photos-message';
                noPhotosMsg.textContent = 'No photos found in this category.';
                noPhotosMsg.style.width = '100%';
                noPhotosMsg.style.textAlign = 'center';
                noPhotosMsg.style.padding = '3rem';
                galleryContainer.appendChild(noPhotosMsg);
                return;
            }
            
            // Add photos to gallery
            photos.forEach(photo => {
                const categoryName = photo.category === 'fire' ? 'Fire Departments' : 
                                    photo.category === 'sunset' ? 'Sunsets' :
                                    photo.category === 'sunrise' ? 'Sunrises' :
                                    photo.category === 'airplane' ? 'Airplanes' : 'Other';
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${photo.path}" alt="Photo" class="gallery-img">
                    <div class="gallery-overlay">
                        <h3 class="gallery-title">${photo.filename.split('-')[0]}</h3>
                        <p class="gallery-category">${categoryName}</p>
                    </div>
                `;
                galleryContainer.appendChild(galleryItem);
            });
        })
        .catch(error => {
            console.error('Error loading photos:', error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Error loading photos. Please try again later.';
            errorMsg.style.width = '100%';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.padding = '3rem';
            errorMsg.style.color = '#ff5e3a';
            galleryContainer.innerHTML = '';
            galleryContainer.appendChild(errorMsg);
        });
}
</script>
