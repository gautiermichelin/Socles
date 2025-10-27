<template>
  <div class="qr-scanner-modal" @click.self="close">
    <div class="qr-scanner-container">
      <div class="scanner-header">
        <h3>Scanner un QR Code</h3>
        <button @click="close" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="scanner-body">
        <video ref="videoElement" class="scanner-video"></video>
        <div class="scanner-overlay">
          <div class="scanner-frame"></div>
        </div>
        <p class="scanner-instruction">Positionnez le QR code dans le cadre</p>
      </div>

      <div v-if="error" class="scanner-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import QrScanner from 'qr-scanner'

export default {
  name: 'QRScanner',
  emits: ['scan', 'close'],
  setup(props, { emit }) {
    const videoElement = ref(null)
    const error = ref('')
    let qrScanner = null

    const close = () => {
      emit('close')
    }

    const handleScan = (result) => {
      if (result && result.data) {
        // Stop scanner
        if (qrScanner) {
          qrScanner.stop()
        }
        // Emit the scanned data
        emit('scan', result.data)
        close()
      }
    }

    onMounted(async () => {
      try {
        // Initialize QR Scanner
        qrScanner = new QrScanner(
          videoElement.value,
          handleScan,
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )

        // Start scanning
        await qrScanner.start()
      } catch (err) {
        console.error('Error starting QR scanner:', err)
        error.value = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.'
      }
    })

    onUnmounted(() => {
      // Clean up scanner
      if (qrScanner) {
        qrScanner.stop()
        qrScanner.destroy()
      }
    })

    return {
      videoElement,
      error,
      close
    }
  }
}
</script>

<style scoped>
.qr-scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.qr-scanner-container {
  background: white;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.scanner-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.close-button:hover {
  background: var(--color-border);
}

.scanner-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 400px;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid #4CAF50;
  border-radius: var(--radius-lg);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    border-color: #4CAF50;
  }
  50% {
    border-color: #81C784;
  }
}

.scanner-instruction {
  position: absolute;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  margin: 0;
  white-space: nowrap;
}

.scanner-error {
  background: #fee;
  color: #c33;
  padding: var(--spacing-md);
  text-align: center;
  font-size: 0.9rem;
}
</style>
