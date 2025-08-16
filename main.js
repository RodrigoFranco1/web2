// ===== UTILIDADES ===== 
function removeDebugElements() {
  const debugElements = document.querySelectorAll('#autoplay-toggle, .carousel-debug, [data-debug="carousel"]');
  debugElements.forEach(element => element.remove());
}

function respectsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ===== CARRUSEL ROTATIVO =====
class RotatingServicesCarousel {
  constructor(container) {
    this.container = container;
    this.cards = [...container.querySelectorAll('.rotating-service-card')];
    this.indicators = [...container.querySelectorAll('.rotating-carousel__indicator')];
    this.prevButton = container.querySelector('.rotating-carousel__nav--prev');
    this.nextButton = container.querySelector('.rotating-carousel__nav--next');
    
    this.currentIndex = 0;
    this.autoplayInterval = null;
    this.autoplayDelay = 4500;
    this.isPlaying = !respectsReducedMotion();
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    
    this.init();
  }
  
  init() {
    if (this.cards.length === 0) return;
    
    this.setupCards();
    this.setupEventListeners();
    this.updateIndicators();
    this.updateAriaStates();
    
    if (this.isPlaying) {
      this.startAutoplay();
    }
  }
  
  setupCards() {
    this.cards.forEach((card, index) => {
      // Remover todas las clases de posición
      card.classList.remove('rotating-service-card--left', 'rotating-service-card--center', 'rotating-service-card--right');
      
      // Asignar posición basada en el índice actual
      const position = this.getCardPosition(index);
      if (position) {
        card.classList.add(`rotating-service-card--${position}`);
      }
    });
  }
  
  getCardPosition(cardIndex) {
    const totalCards = this.cards.length;
    const leftIndex = (this.currentIndex - 1 + totalCards) % totalCards;
    const rightIndex = (this.currentIndex + 1) % totalCards;
    
    if (cardIndex === this.currentIndex) return 'center';
    if (cardIndex === leftIndex) return 'left';
    if (cardIndex === rightIndex) return 'right';
    return null; // Tarjetas ocultas
  }
  
  setupEventListeners() {
    // Navegación con botones
    this.prevButton?.addEventListener('click', () => this.prev());
    this.nextButton?.addEventListener('click', () => this.next());
    
    // Indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
    
    // Pausa en hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.container.addEventListener('mouseleave', () => {
      if (this.isPlaying) this.startAutoplay();
    });
    
    // Touch/Swipe
    this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.container.addEventListener('touchend', () => this.handleTouchEnd(), { passive: true });
    
    // Mouse drag (opcional)
    this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.container.addEventListener('mouseup', () => this.handleMouseUp());
    this.container.addEventListener('mouseleave', () => this.handleMouseUp());
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.updateCarousel();
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.updateCarousel();
  }
  
  goToSlide(index) {
    if (index >= 0 && index < this.cards.length) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }
  
  updateCarousel() {
    this.setupCards();
    this.updateIndicators();
    this.updateAriaStates();
  }
  
  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        indicator.classList.add('rotating-carousel__indicator--active');
      } else {
        indicator.classList.remove('rotating-carousel__indicator--active');
      }
    });
  }
  
  updateAriaStates() {
    this.cards.forEach((card, index) => {
      if (index === this.currentIndex) {
        card.setAttribute('aria-current', 'true');
      } else {
        card.removeAttribute('aria-current');
      }
    });
  }
  
  startAutoplay() {
    if (!this.isPlaying || respectsReducedMotion()) return;
    
    this.pauseAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  // Touch Events
  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.pauseAutoplay();
  }
  
  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
  }
  
  handleTouchEnd() {
    if (!this.isDragging) return;
    
    const diffX = this.startX - this.currentX;
    const threshold = 50;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
    
    this.isDragging = false;
    if (this.isPlaying) this.startAutoplay();
  }
  
  // Mouse Events (para drag en desktop)
  handleMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.pauseAutoplay();
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
  }
  
  handleMouseUp() {
    if (!this.isDragging) return;
    
    const diffX = this.startX - this.currentX;
    const threshold = 50;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
    
    this.isDragging = false;
    if (this.isPlaying) this.startAutoplay();
  }
}

// ===== VALIDACIÓN DE FORMULARIO =====
class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = {
      nombre: form.querySelector('#nombre'),
      email: form.querySelector('#email'),
      empresa: form.querySelector('#empresa'),
      mensaje: form.querySelector('#mensaje'),
      timestamp: form.querySelector('#timestamp')
    };
    
    this.init();
  }
  
  init() {
    // Configurar timestamp
    if (this.fields.timestamp) {
      this.fields.timestamp.value = Date.now().toString();
    }
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Validación en tiempo real
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field && fieldName !== 'timestamp') {
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => this.clearFieldError(fieldName));
      }
    });
    
    // Envío del formulario
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateField(fieldName) {
    const field = this.fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (!field || !errorElement) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Validación required
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio.';
    }
    
    // Validación específica de email
    if (fieldName === 'email' && field.value.trim()) {
      if (!this.isValidEmail(field.value)) {
        isValid = false;
        errorMessage = 'Por favor, ingresa un email válido.';
      } else if (!this.isCorporateEmail(field.value)) {
        isValid = false;
        errorMessage = 'Por favor, utiliza un email corporativo.';
      }
    }
    
    this.updateFieldState(field, errorElement, isValid, errorMessage);
    return isValid;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  isCorporateEmail(email) {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'live.com', 'icloud.com', 'protonmail.com', 'aol.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !personalDomains.includes(domain);
  }
  
  updateFieldState(field, errorElement, isValid, errorMessage) {
    if (isValid) {
      field.setAttribute('aria-invalid', 'false');
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    } else {
      field.setAttribute('aria-invalid', 'true');
      errorElement.textContent = errorMessage;
      errorElement.classList.add('visible');
    }
  }
  
  clearFieldError(fieldName) {
    const field = this.fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement && field.value.trim()) {
      field.setAttribute('aria-invalid', 'false');
      errorElement.classList.remove('visible');
    }
  }
  
  validateForm() {
    let isFormValid = true;
    
    // Validar todos los campos
    Object.keys(this.fields).forEach(fieldName => {
      if (fieldName !== 'timestamp') {
        const fieldValid = this.validateField(fieldName);
        if (!fieldValid) isFormValid = false;
      }
    });
    
    // Verificar honeypot
    const honeypot = this.form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      isFormValid = false;
    }
    
    return isFormValid;
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Actualizar timestamp
    if (this.fields.timestamp) {
      this.fields.timestamp.value = Date.now().toString();
    }
    
    if (!this.validateForm()) {
      return;
    }
    
    const submitButton = this.form.querySelector('button[type="submit"]');
    const successElement = this.form.querySelector('.form-success');
    
    // Estado de carga
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }
    
    try {
      // Simular envío (en producción sería un fetch a Netlify)
      await this.simulateFormSubmission();
      
      // Mostrar éxito
      if (successElement) {
        successElement.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
        successElement.classList.add('visible');
      }
      
      // Limpiar formulario
      this.form.reset();
      if (this.fields.timestamp) {
        this.fields.timestamp.value = Date.now().toString();
      }
      
      // Limpiar estados de error
      Object.keys(this.fields).forEach(fieldName => {
        if (fieldName !== 'timestamp') {
          this.clearFieldError(fieldName);
        }
      });
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      if (successElement) {
        successElement.textContent = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
        successElement.classList.add('visible');
      }
    } finally {
      // Restaurar botón
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Mensaje';
      }
    }
  }
  
  simulateFormSubmission() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  }
}

// ===== MENÚ MÓVIL =====
class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.nav = document.querySelector('.header__nav');
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.toggle || !this.nav) return;
    
    this.toggle.addEventListener('click', () => this.toggleMenu());
    
    // Cerrar al hacer clic en un enlace
    const navLinks = this.nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
  }
  
  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.isOpen = true;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.nav.style.display = 'block';
    
    // Animar hamburguesa
    const hamburgers = this.toggle.querySelectorAll('.hamburger');
    hamburgers[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
    hamburgers[1].style.opacity = '0';
    hamburgers[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
  }
  
  closeMenu() {
    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.nav.style.display = 'none';
    
    // Restaurar hamburguesa
    const hamburgers = this.toggle.querySelectorAll('.hamburger');
    hamburgers[0].style.transform = 'none';
    hamburgers[1].style.opacity = '1';
    hamburgers[2].style.transform = 'none';
  }
}

// ===== NAVEGACIÓN SUAVE =====
function setupSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: respectsReducedMotion() ? 'auto' : 'smooth'
        });
      }
    });
  });
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Eliminar elementos de debug
  removeDebugElements();
  
  // Inicializar carrusel
  const carouselContainer = document.querySelector('.rotating-carousel');
  if (carouselContainer) {
    new RotatingServicesCarousel(carouselContainer);
  }
  
  // Inicializar validación de formulario
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    new FormValidator(contactForm);
  }
  
  // Inicializar menú móvil
  new MobileMenu();
  
  // Configurar navegación suave
  setupSmoothScrolling();
  
  // Configurar comportamiento de reduced motion
  if (respectsReducedMotion()) {
    document.body.classList.add('reduced-motion');
  }
  
  console.log('D38 Security Labs - Sitio inicializado correctamente');
});

// ===== UTILIDADES ADICIONALES =====

// Detectar cambios en preferencias de movimiento
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  if (e.matches) {
    document.body.classList.add('reduced-motion');
    
    // Pausar autoplay en carrusel
    const carousel = document.querySelector('.rotating-carousel');
    if (carousel && carousel.carouselInstance) {
      carousel.carouselInstance.pauseAutoplay();
      carousel.carouselInstance.isPlaying = false;
    }
  } else {
    document.body.classList.remove('reduced-motion');
  }
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
  console.error('Error en D38 Security Labs:', e.error);
});

// Exposar instancias para debugging (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.D38 = {
    carousel: null,
    formValidator: null,
    mobileMenu: null
  };
}