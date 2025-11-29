<template>
  <footer class="app-footer">
    <img src="/images/logo-musee-quai-branly.png" alt="Musée du Quai Branly Jacques Chirac" class="footer-logo" />
    <div class="footer-credit">
      Développé par <a href="https://www.ideesculture.com" target="_blank" rel="noopener noreferrer">IdéesCulture</a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.app-footer {
  background: white;
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
}

.footer-logo {
  height: 40px;
  object-fit: contain;
}

.footer-credit {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.footer-credit a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.footer-credit a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-logo {
    max-width: 120px;
  }

  .footer-credit {
    font-size: 10px;
  }
}
</style>
