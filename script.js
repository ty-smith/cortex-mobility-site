const openWhitepaperButton = document.querySelector("[data-open-whitepaper]");
const whitepaperModal = document.querySelector("[data-whitepaper-modal]");
const closeWhitepaperButtons = document.querySelectorAll("[data-close-whitepaper]");
const whitepaperForm = document.querySelector("[data-whitepaper-form]");
const whitepaperStatus = document.querySelector("[data-whitepaper-status]");
const openContactButton = document.querySelector("[data-open-contact]");
const contactModal = document.querySelector("[data-contact-modal]");
const closeContactButtons = document.querySelectorAll("[data-close-contact]");
const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const siteHeader = document.querySelector(".site-header");

const WEB3FORMS_ACCESS_KEY = "8f117d68-7fb6-4dcd-a9b5-b7db4d1e5653";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const syncHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
};

const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth;

const setStatus = (element, message) => {
  if (!element) return;
  element.textContent = message;
};

const isWeb3FormsConfigured = () =>
  WEB3FORMS_ACCESS_KEY &&
  WEB3FORMS_ACCESS_KEY !== "PASTE_WEB3FORMS_ACCESS_KEY_HERE";

const submitToWeb3Forms = async ({
  form,
  subject,
  replyTo,
  statusElement,
  extraFields = {},
}) => {
  if (!isWeb3FormsConfigured()) {
    setStatus(
      statusElement,
      "Add your Web3Forms access key in script.js to enable email sending."
    );
    return { success: false, configured: false };
  }

  const formData = new FormData(form);
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  formData.append("subject", subject);
  formData.append("from_name", "Cortex Mobility Website");
  formData.append("replyto", replyTo);
  Object.entries(extraFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  setStatus(statusElement, "Sending...");

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to send form.");
    }

    setStatus(statusElement, "Sent successfully.");
    return { success: true };
  } catch (error) {
    setStatus(
      statusElement,
      error instanceof Error ? error.message : "Unable to send form."
    );
    return { success: false };
  }
};

const openModal = (modal) => {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.paddingRight = `${getScrollbarWidth()}px`;
  document.body.style.overflow = "hidden";
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.paddingRight = "";
  document.body.style.overflow = "";
};

if (openWhitepaperButton) {
  openWhitepaperButton.addEventListener("click", () => openModal(whitepaperModal));
}

closeWhitepaperButtons.forEach((button) => {
  button.addEventListener("click", () => closeModal(whitepaperModal));
});

if (openContactButton) {
  openContactButton.addEventListener("click", () => openModal(contactModal));
}

closeContactButtons.forEach((button) => {
  button.addEventListener("click", () => closeModal(contactModal));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && whitepaperModal && !whitepaperModal.hidden) {
    closeModal(whitepaperModal);
  }

  if (event.key === "Escape" && contactModal && !contactModal.hidden) {
    closeModal(contactModal);
  }
});

if (whitepaperForm) {
  whitepaperForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!whitepaperForm.reportValidity()) {
      return;
    }

    const formData = new FormData(whitepaperForm);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();

    const submission = await submitToWeb3Forms({
      form: whitepaperForm,
      subject: `Whitepaper download request from ${firstName} ${lastName}`.trim(),
      replyTo: email,
      statusElement: whitepaperStatus,
    });

    if (!submission.success) {
      return;
    }

    const link = document.createElement("a");
    link.href = "./assets/cortex-phoenix-childrens-case-study.pdf";
    link.download = "Cortex-Phoenix-Childrens-Case-Study.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    whitepaperForm.reset();
    setStatus(whitepaperStatus, "");
    closeModal(whitepaperModal);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const comment = String(formData.get("comment") || "").trim();

    const submission = await submitToWeb3Forms({
      form: contactForm,
      subject: `Website inquiry from ${firstName} ${lastName}`.trim(),
      replyTo: email,
      statusElement: contactStatus,
      extraFields: {
        message: [
          `First name: ${firstName}`,
          `Last name: ${lastName}`,
          `Company: ${company}`,
          `Email: ${email}`,
          "",
          "Comment:",
          comment,
        ].join("\n"),
      },
    });

    if (!submission.success) {
      return;
    }

    contactForm.reset();
    setStatus(contactStatus, "");
    closeModal(contactModal);
  });
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });
