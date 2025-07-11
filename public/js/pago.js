// Sistema de Pago Moderno - RedPro Academy
class CheckoutSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('carrito')) || [];
        this.discount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCartItems();
        this.updateTotals();
        this.setupCardNumberFormatting();
        this.setupExpirationFormatting();
    }

    setupEventListeners() {
        // Cambio de método de pago
        document.querySelectorAll('input[name="metodo"]').forEach(radio => {
            radio.addEventListener('change', () => this.handlePaymentMethodChange());
        });

        // Validación en tiempo real
        document.getElementById('numero-tarjeta')?.addEventListener('input', (e) => this.formatCardNumber(e));
        document.getElementById('fecha-vencimiento')?.addEventListener('input', (e) => this.formatExpiration(e));
        document.getElementById('cvv')?.addEventListener('input', (e) => this.validateCVV(e));

        // Código de descuento
        document.getElementById('aplicar-descuento')?.addEventListener('click', () => this.applyDiscount());

        // Envío del formulario
        document.getElementById('form-pago')?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validación de DNI
        document.getElementById('dni')?.addEventListener('input', (e) => this.formatDNI(e));
    }

    handlePaymentMethodChange() {
        const selectedMethod = document.querySelector('input[name="metodo"]:checked').value;
        
        // Ocultar todos los formularios
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('d-none');
        });

        // Mostrar el formulario correspondiente
        const formToShow = document.getElementById(`${selectedMethod}-form`);
        if (formToShow) {
            formToShow.classList.remove('d-none');
        }

        // Actualizar opciones de pago visuales
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`[data-method="${selectedMethod}"]`)?.classList.add('selected');
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        if (formattedValue.length <= 19) {
            e.target.value = formattedValue;
        }

        // Detectar tipo de tarjeta
        this.detectCardType(value);
    }

    detectCardType(number) {
        const cardTypeIcon = document.getElementById('card-type-icon');
        let icon = 'fas fa-credit-card';
        
        if (number.startsWith('4')) {
            icon = 'fab fa-cc-visa';
        } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
            icon = 'fab fa-cc-mastercard';
        } else if (number.startsWith('3')) {
            icon = 'fab fa-cc-amex';
        }
        
        cardTypeIcon.innerHTML = `<i class="${icon}"></i>`;
    }

    formatExpiration(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    validateCVV(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    }

    formatDNI(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 8);
    }

    setupCardNumberFormatting() {
        const cardInput = document.getElementById('numero-tarjeta');
        if (cardInput) {
            cardInput.addEventListener('keypress', (e) => {
                if (!/[\d\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        }
    }

    setupExpirationFormatting() {
        const expirationInput = document.getElementById('fecha-vencimiento');
        if (expirationInput) {
            expirationInput.addEventListener('keypress', (e) => {
                if (!/[\d/]/.test(e.key) && !['Backspace', 'Delete', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        }
    }

    loadCartItems() {
        const cartContainer = document.getElementById('lista-carrito');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>Tu carrito está vacío</h5>
                    <a href="Cursos.html" class="btn btn-primary">Ver cursos</a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <div class="item-info">
                    <h6>${item.nombre}</h6>
                    <small>Cantidad: ${item.cantidad}</small>
                </div>
                <div class="item-price">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
        `).join('');
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => {
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 1;
            return total + (precio * cantidad);
        }, 0);
    }

    updateTotals() {
        const subtotal = this.calculateSubtotal();
        const discountAmount = subtotal * (this.discount / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const igv = subtotalAfterDiscount * 0.18;
        const total = subtotalAfterDiscount + igv;

        // Verificar que los valores no sean NaN
        const formatPrice = (value) => isNaN(value) ? '0.00' : value.toFixed(2);

        document.getElementById('subtotal').textContent = `S/ ${formatPrice(subtotal)}`;
        document.getElementById('descuento').textContent = `-S/ ${formatPrice(discountAmount)}`;
        document.getElementById('igv').textContent = `S/ ${formatPrice(igv)}`;
        document.getElementById('total-final').innerHTML = `<strong>S/ ${formatPrice(total)}</strong>`;
        document.getElementById('total-btn').textContent = `S/ ${formatPrice(total)}`;
    }

    applyDiscount() {
        const codeInput = document.getElementById('codigo-descuento');
        const code = codeInput.value.trim().toUpperCase();
        
        const discountCodes = {
            'REDPRO10': 10,
            'ESTUDIANTE': 15,
            'PRIMERA': 20,
            'PROMO2025': 25
        };

        if (discountCodes[code]) {
            this.discount = discountCodes[code];
            this.updateTotals();
            this.showNotification(`¡Código aplicado! ${this.discount}% de descuento`, 'success');
            codeInput.value = '';
        } else {
            this.showNotification('Código de descuento inválido', 'error');
        }
    }

    validateForm() {
        const requiredFields = {
            'nombre': 'Nombre completo',
            'email': 'Correo electrónico',
            'telefono-contacto': 'Teléfono',
            'dni': 'DNI'
        };

        for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showNotification(`${fieldName} es obligatorio`, 'error');
                field?.focus();
                return false;
            }
        }

        // Validar email
        const email = document.getElementById('email').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showNotification('Correo electrónico inválido', 'error');
            return false;
        }

        // Validar DNI
        const dni = document.getElementById('dni').value;
        if (!/^\d{8}$/.test(dni)) {
            this.showNotification('DNI debe tener 8 dígitos', 'error');
            return false;
        }

        // Validar método de pago específico
        const selectedMethod = document.querySelector('input[name="metodo"]:checked').value;
        return this.validatePaymentMethod(selectedMethod);
    }

    validatePaymentMethod(method) {
        switch (method) {
            case 'tarjeta':
                return this.validateCard();
            case 'yape':
                return this.validateYape();
            case 'transferencia':
                return this.validateTransfer();
            default:
                return false;
        }
    }

    validateCard() {
        const cardNumber = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
        const cardName = document.getElementById('nombre-tarjeta').value.trim();
        const expiration = document.getElementById('fecha-vencimiento').value;
        const cvv = document.getElementById('cvv').value;

        if (!/^\d{16}$/.test(cardNumber)) {
            this.showNotification('Número de tarjeta inválido', 'error');
            return false;
        }

        if (!cardName) {
            this.showNotification('Nombre en la tarjeta es obligatorio', 'error');
            return false;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiration)) {
            this.showNotification('Fecha de vencimiento inválida (MM/AA)', 'error');
            return false;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            this.showNotification('CVV inválido', 'error');
            return false;
        }

        return true;
    }

    validateYape() {
        const phone = document.getElementById('telefono-yape').value.trim();
        if (!/^\d{9}$/.test(phone)) {
            this.showNotification('Número de teléfono Yape inválido', 'error');
            return false;
        }
        return true;
    }

    validateTransfer() {
        const voucher = document.getElementById('comprobante').files[0];
        if (!voucher) {
            this.showNotification('Debe subir el comprobante de pago', 'error');
            return false;
        }
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!document.getElementById('terminos').checked) {
            this.showNotification('Debe aceptar los términos y condiciones', 'error');
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        if (this.cart.length === 0) {
            this.showNotification('Su carrito está vacío', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = document.querySelector('.btn-checkout-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
        submitBtn.disabled = true;

        try {
            // Simular procesamiento de pago
            console.log('🚀 Iniciando procesamiento de pago...');
            const result = await this.processPayment();
            
            console.log('✅ Pago procesado exitosamente:', result);
            
            // Limpiar carrito
            localStorage.removeItem('carrito');
            console.log('🧹 Carrito limpiado');
            
            // Mostrar modal de éxito
            const modal = new bootstrap.Modal(document.getElementById('confirmacionModal'));
            modal.show();
            console.log('🎉 Modal de confirmación mostrado');

            // Enviar notificación por email (opcional)
            await this.sendOrderConfirmation();

        } catch (error) {
            console.error('❌ Error en handleSubmit:', error);
            console.error('❌ Detalles del error:', error.message);
            this.showNotification(`Error al procesar el pago: ${error.message}`, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            console.log('🔄 Botón restaurado');
        }
    }

    async processPayment() {
        // Preparar datos de la orden
        const orderData = {
            customer: {
                name: document.getElementById('nombre').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('telefono-contacto').value.trim(),
                dni: document.getElementById('dni').value.trim()
            },
            items: this.cart,
            total: this.calculateTotal(),
            paymentMethod: document.querySelector('input[name="metodo"]:checked').value,
            discount: this.discount
        };

        console.log('📤 Enviando datos de orden:', orderData);

        // Enviar orden al servidor
        const response = await fetch('/procesar-orden', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        console.log('📡 Respuesta del servidor (status):', response.status);

        const result = await response.json();
        console.log('📡 Respuesta del servidor (data):', result);
        
        if (!result.success) {
            console.error('❌ Error en el procesamiento:', result.error);
            throw new Error(result.error || 'Error al procesar la orden');
        }

        console.log('✅ Orden procesada exitosamente:', result.orderNumber);
        return result;
    }

    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const discountAmount = subtotal * (this.discount / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const igv = subtotalAfterDiscount * 0.18;
        return subtotalAfterDiscount + igv;
    }

    async sendOrderConfirmation() {
        const orderData = {
            customer: {
                name: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('telefono-contacto').value,
                dni: document.getElementById('dni').value
            },
            items: this.cart,
            total: this.calculateSubtotal() * (1 - this.discount/100) * 1.18,
            paymentMethod: document.querySelector('input[name="metodo"]:checked').value,
            orderDate: new Date().toISOString()
        };

        // Aquí podrías enviar los datos al servidor
        console.log('Orden procesada:', orderData);
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(toast);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutSystem();
});
