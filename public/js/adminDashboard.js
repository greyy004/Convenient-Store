let selectedProductImage = '';

document.addEventListener("DOMContentLoaded", async()=>{
    const ctx = document.getElementById('sales-id');
    try{
        const res = await fetch('/admin/sales/data',{
            method: 'get', 
            headers: {
                'content-type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to fetch sales data');
        }

        // Create the pie chart
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Sales',
                    data: data.values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    } catch (err) {
        console.error('Error fetching sales data:', err);
    }
});


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
        throw new Error(data.message|| 'failed to fetch total user count');
    }
    total_users.innerHTML=data.totalUsers;
}catch(err)
{
    alert(err.message || 'Failed to fetch total user count');
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
        throw new Error(data.message|| 'failed to fetch total product count');
    }
    totalProducts.innerHTML=data.totalProducts;
}catch(err)
{
    alert(err.message || 'Failed to fetch total product count');
}
});

function setupIconPreview() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('avatarInput');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = previewDiv.querySelector('img');
    const placeholder = uploadArea.querySelector('.upload-placeholder');

    const showPreview = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            selectedProductImage = event.target.result;
            previewDiv.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        showPreview(file);
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('is-dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('is-dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('is-dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            showPreview(file);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('productForm');
    
    if (form) {
        setupIconPreview();
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                product_name: form.product_name.value.trim(),
                description: form.description.value.trim(),
                price: form.price.value,
                stock: form.stock.value,
                product_img_url: selectedProductImage
            };

            try {
                const res = await fetch('/products/addProduct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if(!res.ok) {
                    throw new Error(result.message || 'Failed to add product');
                }
                alert(result.message);

                form.reset();
                selectedProductImage = '';
                const previewDiv = document.getElementById('imagePreview');
                const previewImg = previewDiv?.querySelector('img');
                const placeholder = document.querySelector('#uploadArea .upload-placeholder');
                if (previewImg) {
                    previewImg.src = '';
                }
                if (previewDiv) {
                    previewDiv.style.display = 'none';
                }
                if (placeholder) {
                    placeholder.style.display = 'flex';
                }
            } catch (err) {
                console.error(err);
                alert(err.message || 'Error adding product');
            }
        });
    }
});

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const res = await fetch('/auth/logout', {
                method: 'POST'
            });
            if (res.ok) {
                window.location.href = '/html/index.html';
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }
}
