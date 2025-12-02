import { playSound } from '../audio';

let currentModal = null;

export function openModal(modalElement) {
  if (currentModal && document.body.contains(currentModal)) {
    currentModal.remove();
  }
  document.body.append(modalElement);
  modalElement.classList.add('modal--active');
  document.body.style.overflow = 'hidden';
  currentModal = modalElement;
  playSound('select');
}

export function closeCurrentModal() {
  if (!currentModal) return;
  currentModal.classList.remove('modal--active');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (document.body.contains(currentModal)) {
      currentModal.remove();
    }
    currentModal = null;
  }, 300);
  playSound('select');
}
