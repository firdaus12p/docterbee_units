/**
 * Gallery Manager - Admin Dashboard
 * Handles CRUD operations for homepage gallery images
 */

// ============================================
// GALLERY STATE
// ============================================
let galleryImages = [];
let editingGalleryId = null;

// ============================================
// GALLERY FUNCTIONS
// ============================================

/**
 * Load all gallery images for admin view
 */
async function loadGalleryImages() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-span-full text-center py-8 text-slate-400">
      <div class="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p>Memuat galeri...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/gallery/admin', { credentials: 'include' });
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Gagal memuat galeri');
    }

    galleryImages = result.data || [];

    if (galleryImages.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <i data-lucide="image-off" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
          <p class="text-lg font-semibold mb-2">Belum ada foto</p>
          <p class="text-sm">Klik "Tambah Foto" untuk menambahkan foto ke galeri beranda</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    grid.innerHTML = galleryImages.map(image => renderGalleryCard(image)).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (error) {
    console.error('Error loading gallery:', error);
    grid.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-400">
        <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
        <p>Gagal memuat galeri. <button onclick="loadGalleryImages()" class="underline hover:text-amber-400">Coba lagi</button></p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

/**
 * Render a gallery image card
 */
function renderGalleryCard(image) {
  const statusBadge = image.is_active 
    ? '<span class="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">Aktif</span>'
    : '<span class="absolute top-2 left-2 bg-slate-500 text-white text-xs px-2 py-0.5 rounded-full">Nonaktif</span>';

  return `
    <div class="gallery-card relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 hover:border-amber-400/50 transition-all">
      <div class="aspect-[4/3] relative">
        <img 
          src="${image.image_url}" 
          alt="${escapeHtml(image.title || 'Gallery image')}"
          class="w-full h-full object-cover"
          onerror="this.src='/assets/assets/placeholder-gallery.webp'"
        />
        ${statusBadge}
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onclick="openEditGalleryModal(${image.id})"
            class="bg-amber-400 hover:bg-amber-500 text-slate-900 p-2 rounded-lg transition"
            title="Edit"
          >
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button 
            onclick="deleteGalleryImage(${image.id}, '${escapeHtml(image.title || 'foto ini')}')"
            class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
            title="Hapus"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
      <div class="p-2 text-center">
        <p class="text-xs text-slate-400 truncate">${escapeHtml(image.title || 'Tanpa judul')}</p>
        <p class="text-xs text-slate-500">Urutan: ${image.sort_order}</p>
      </div>
    </div>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Open modal to add new gallery image
 */
function openNewGalleryModal() {
  editingGalleryId = null;
  document.getElementById('galleryModalTitle').textContent = 'Tambah Foto Galeri';
  document.getElementById('galleryForm').reset();
  document.getElementById('galleryId').value = '';
  document.getElementById('galleryImageUrl').value = '';
  document.getElementById('galleryImagePreview').classList.add('hidden');
  document.getElementById('galleryIsActive').checked = true;
  document.getElementById('gallerySortOrder').value = '0';
  
  const modal = document.getElementById('galleryModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Open modal to edit existing gallery image
 */
function openEditGalleryModal(id) {
  const image = galleryImages.find(img => img.id === id);
  if (!image) {
    alert('Gambar tidak ditemukan');
    return;
  }

  editingGalleryId = id;
  document.getElementById('galleryModalTitle').textContent = 'Edit Foto Galeri';
  document.getElementById('galleryId').value = image.id;
  document.getElementById('galleryTitle').value = image.title || '';
  document.getElementById('galleryDescription').value = image.description || '';
  document.getElementById('galleryImageUrl').value = image.image_url || '';
  document.getElementById('gallerySortOrder').value = image.sort_order || 0;
  document.getElementById('galleryIsActive').checked = image.is_active;

  // Show preview if image exists
  if (image.image_url) {
    document.getElementById('galleryPreviewImg').src = image.image_url;
    document.getElementById('galleryImagePreview').classList.remove('hidden');
  } else {
    document.getElementById('galleryImagePreview').classList.add('hidden');
  }

  const modal = document.getElementById('galleryModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Close gallery modal
 */
function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  editingGalleryId = null;
}

/**
 * Handle gallery form submission
 */
async function handleGalleryFormSubmit(e) {
  e.preventDefault();

  const imageUrl = document.getElementById('galleryImageUrl').value;
  const id = document.getElementById('galleryId').value;
  const title = document.getElementById('galleryTitle').value.trim();
  const description = document.getElementById('galleryDescription').value.trim();
  const sortOrder = parseInt(document.getElementById('gallerySortOrder').value) || 0;
  const isActive = document.getElementById('galleryIsActive').checked;

  // Validate image URL (required for new, optional for edit if already has image)
  if (!id && !imageUrl) {
    alert('Silakan upload foto terlebih dahulu');
    return;
  }

  const data = {
    title: title || null,
    description: description || null,
    sort_order: sortOrder,
    is_active: isActive,
  };

  // Only include image_url if provided
  if (imageUrl) {
    data.image_url = imageUrl;
  }

  try {
    const url = id ? `/api/gallery/${id}` : '/api/gallery';
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Gagal menyimpan');
    }

    closeGalleryModal();
    loadGalleryImages();
    
    // Show success notification
    if (typeof showSuccessToast === 'function') {
      showSuccessToast(id ? 'Foto berhasil diperbarui' : 'Foto berhasil ditambahkan');
    }

  } catch (error) {
    console.error('Error saving gallery image:', error);
    alert('Gagal menyimpan foto: ' + error.message);
  }
}

/**
 * Delete a gallery image
 */
async function deleteGalleryImage(id, title) {
  if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Gagal menghapus');
    }

    loadGalleryImages();
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast('Foto berhasil dihapus');
    }

  } catch (error) {
    console.error('Error deleting gallery image:', error);
    alert('Gagal menghapus foto: ' + error.message);
  }
}

/**
 * Handle file upload for gallery image
 */
async function handleGalleryFileUpload(file) {
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimal 5MB.');
    return;
  }

  const formData = new FormData();
  // Use 'file' field name to match the generic upload endpoint in upload.mjs
  formData.append('file', file);

  try {
    // Show loading state
    const fileInput = document.getElementById('galleryImageFile');
    const originalText = fileInput.nextElementSibling?.textContent;
    if (fileInput.nextElementSibling) {
      fileInput.nextElementSibling.textContent = 'Mengupload...';
    }

    // Use the generic upload endpoint /api/upload (not /api/upload/image)
    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Gagal upload');
    }

    // The endpoint returns filePath or data.url
    const uploadedUrl = result.filePath || result.data?.url;
    
    if (!uploadedUrl) {
      throw new Error('URL gambar tidak ditemukan dalam response');
    }

    // Set the uploaded URL
    document.getElementById('galleryImageUrl').value = uploadedUrl;
    
    // Show preview
    document.getElementById('galleryPreviewImg').src = uploadedUrl;
    document.getElementById('galleryImagePreview').classList.remove('hidden');

    // Restore original text
    if (fileInput.nextElementSibling && originalText) {
      fileInput.nextElementSibling.textContent = originalText;
    }
    
    // Refresh Lucide icons for the remove button
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Gagal upload foto: ' + error.message);
  }
}

/**
 * Remove selected image
 */
function removeGalleryImagePreview() {
  document.getElementById('galleryImageUrl').value = '';
  document.getElementById('galleryImageFile').value = '';
  document.getElementById('galleryImagePreview').classList.add('hidden');
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Button to open new gallery modal
  const btnNewGallery = document.getElementById('btnNewGalleryImage');
  if (btnNewGallery) {
    btnNewGallery.addEventListener('click', openNewGalleryModal);
  }

  // Close modal buttons
  const closeBtn = document.getElementById('closeGalleryModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeGalleryModal);
  }

  const cancelBtn = document.getElementById('cancelGallery');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeGalleryModal);
  }

  // Form submission
  const galleryForm = document.getElementById('galleryForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', handleGalleryFormSubmit);
  }

  // File upload handler
  const fileInput = document.getElementById('galleryImageFile');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        handleGalleryFileUpload(e.target.files[0]);
      }
    });
  }

  // Remove image button
  const removeBtn = document.getElementById('removeGalleryImage');
  if (removeBtn) {
    removeBtn.addEventListener('click', removeGalleryImagePreview);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeGalleryModal();
      }
    });
  }
});

// Export for external use
window.loadGalleryImages = loadGalleryImages;
