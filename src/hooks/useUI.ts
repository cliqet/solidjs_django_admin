export const scrollToTopForm = (formId: string) => {
  let formEl = document.getElementById(formId);
  if (formEl) {
    const authMainEl = document.getElementById('auth-main');
    
    if (authMainEl) {
      // Calculate the form's position relative to the container
      // since scrolling using form alone does not go to the top of auth-main
      // to show the Toast
      const formPosition = formEl.getBoundingClientRect().top + authMainEl.scrollTop;

      // Scroll the parent container to the form position
      authMainEl.scrollTo({
        top: formPosition - 200,
        behavior: "smooth"
      });
    }
  }
};
