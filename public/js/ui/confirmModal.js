function openConfirmModal({
  modal,
  textElement,
  confirmButton,
  cancelButton,
  text,
  onConfirm,
  onError,
}) {
  textElement.innerHTML = text;
  modal.style.display = "flex";
  confirmButton.disabled = false;
  cancelButton.disabled = false;

  confirmButton.onclick = async () => {
    confirmButton.disabled = true;
    cancelButton.disabled = true;
    modal.style.display = "none";

    try {
      await onConfirm();
    } catch (error) {
      const message = `Erro ao confirmar ação: ${error.message || error}`;

      console.error("Erro ao executar ação confirmada:", error);

      if (typeof onError === "function") {
        try {
          await onError(message, error);
        } catch (feedbackError) {
          console.error(
            "Erro ao exibir feedback da confirmação:",
            feedbackError,
          );
          alert(message);
        }
      } else {
        alert(message);
      }
    } finally {
      modal.style.display = "none";
      confirmButton.disabled = false;
      cancelButton.disabled = false;
    }
  };

  cancelButton.onclick = () => {
    modal.style.display = "none";
  };
}

export { openConfirmModal };
