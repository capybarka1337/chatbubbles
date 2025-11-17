import './css/main.css';

document.addEventListener('DOMContentLoaded', () => {
  const scrollButtons = document.querySelectorAll('[data-scroll]');
  
  scrollButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const target = button.getAttribute('data-scroll');
      const element = document.querySelector(target);
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  const editorButtons = document.querySelectorAll('#openEditor, #heroStart, #openEditorFromPreview');
  
  editorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.href = 'editor.html';
    });
  });

  observeElements();
});

function observeElements() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const elementsToObserve = document.querySelectorAll('.feature-card, .workflow-step, .faq-item');
  
  elementsToObserve.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.style.transitionDelay = `${index * 0.08}s`;
    observer.observe(el);
  });
}
