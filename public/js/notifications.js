(function () {
    function getStack() {
        let stack = document.querySelector('.notification-stack');
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'notification-stack';
            stack.setAttribute('aria-live', 'polite');
            stack.setAttribute('aria-atomic', 'true');
            document.body.appendChild(stack);
        }
        return stack;
    }

    function removeNotification(notification) {
        notification.classList.add('is-hiding');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }

    window.showNotification = function (message, type = 'info', title) {
        const stack = getStack();
        const notification = document.createElement('div');
        const normalizedType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
        const defaultTitles = {
            success: 'Success',
            error: 'Error',
            warning: 'Notice',
            info: 'Notice'
        };

        notification.className = `notification notification-${normalizedType}`;
        notification.setAttribute('role', normalizedType === 'error' ? 'alert' : 'status');
        notification.innerHTML = `
            <span class="notification-bar" aria-hidden="true"></span>
            <div class="notification-content">
                <p class="notification-title">${title || defaultTitles[normalizedType]}</p>
                <p class="notification-message"></p>
            </div>
            <button class="notification-close" type="button" aria-label="Dismiss notification">&times;</button>
        `;

        notification.querySelector('.notification-message').textContent = message;
        notification.querySelector('.notification-close').addEventListener('click', () => {
            removeNotification(notification);
        });

        stack.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('is-visible'));

        window.setTimeout(() => {
            if (notification.isConnected) {
                removeNotification(notification);
            }
        }, normalizedType === 'error' ? 5500 : 3800);
    };

    window.flashNotification = function (message, type = 'info', title) {
        sessionStorage.setItem('flashNotification', JSON.stringify({ message, type, title }));
    };

    window.showConfirmation = function ({
        title = 'Confirm Action',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel'
    } = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
                    <h2 id="confirmTitle">${title}</h2>
                    <p></p>
                    <div class="confirm-actions">
                        <button class="confirm-btn confirm-cancel" type="button"></button>
                        <button class="confirm-btn confirm-accept" type="button"></button>
                    </div>
                </div>
            `;

            overlay.querySelector('p').textContent = message;
            overlay.querySelector('.confirm-cancel').textContent = cancelText;
            overlay.querySelector('.confirm-accept').textContent = confirmText;

            const close = (value) => {
                overlay.classList.remove('is-visible');
                overlay.addEventListener('transitionend', () => {
                    overlay.remove();
                    resolve(value);
                }, { once: true });
            };

            overlay.querySelector('.confirm-cancel').addEventListener('click', () => close(false));
            overlay.querySelector('.confirm-accept').addEventListener('click', () => close(true));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    close(false);
                }
            });

            const handleKeydown = (event) => {
                if (event.key === 'Escape') {
                    document.removeEventListener('keydown', handleKeydown);
                    close(false);
                }
            };
            document.addEventListener('keydown', handleKeydown);

            document.body.appendChild(overlay);
            requestAnimationFrame(() => {
                overlay.classList.add('is-visible');
                overlay.querySelector('.confirm-accept').focus();
            });
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const flash = sessionStorage.getItem('flashNotification');
        if (!flash) {
            return;
        }

        sessionStorage.removeItem('flashNotification');
        try {
            const { message, type, title } = JSON.parse(flash);
            if (message) {
                window.showNotification(message, type, title);
            }
        } catch (err) {
            console.error('Failed to read flash notification:', err);
        }
    });
})();
