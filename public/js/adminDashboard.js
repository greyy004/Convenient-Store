document.addEventListener("DOMContentLoaded", async()=>{
    const total_users=document.getElementById("totalUsers");
try {
    const res = await fetch('/admin/users/count',{
        method: 'get', 
        headers: {
            'content-type': 'application/json'},
            credentials: 'include'
    }) 
    const data = await res.json();
    if(!res.ok)
    {
        throw new error(data.message|| 'failed to fetch total user count');
    }
    total_users.innerHTML=data.totalUsers;
}catch(err)
{
    alert("error:", err);
}
});


document.addEventListener("DOMContentLoaded", async()=>{
    const totalProducts=document.getElementById("totalProducts");
try {
    const res = await fetch('/admin/products/count',{
        method: 'get', 
        headers: {
            'content-type': 'application/json'},
            credentials: 'include'
    }) 
    const data = await res.json();
    if(!res.ok)
    {
        throw new error(data.message|| 'failed to fetch total user count');
    }
    totalProducts.innerHTML=data.totalProducts;
}catch(err)
{
    alert("error:", err);
}
});

function setupIconPreview() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('avatarInput');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = previewDiv.querySelector('img');
    const placeholder = uploadArea.querySelector('.upload-placeholder');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewDiv.style.display = 'block';
                placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-light)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-light)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('productForm');
    
    if (form) {
        setupIconPreview();
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            try {
                const res = await fetch('/products/addProduct', {
                    method: 'POST',
                    body: formData
                });

                const result = await res.json();
                if(!res.ok) {
                    throw new Error(result.message || 'Failed to add product');
                }
                alert(result.message);

                form.reset();
            } catch (err) {
                console.error(err);
                alert('Error adding product');
            }
        });
    }
});

async function logout() {
    if (await showConfirm('Are you sure you want to logout?')) {
        try {
            await fetch('/auth/authLogout');
            window.location.href = '/html/index.html';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }
}