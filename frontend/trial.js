// ==========================================
// Trial Class Modal Functions
// ==========================================
console.log("Trial JS Loaded");
const trialModal = document.getElementById("trialModal");

function openTrialModal() {
    trialModal.style.display = "flex";
}

function closeTrialModal() {
    trialModal.style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
    if (event.target === trialModal) {
        closeTrialModal();
    }
});

// ==========================================
// Trial Form Submission
// ==========================================

const trialForm = document.getElementById("trialForm");

if (trialForm) {

    trialForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("trialName").value.trim();
        const mobile = document.getElementById("trialMobile").value.trim();
        const whatsapp = document.getElementById("trialWhatsapp").value.trim();
        const studentClass = document.getElementById("trialClass").value;
        const medium = document.getElementById("trialMedium").value;

        // -----------------------------
        // Validation
        // -----------------------------

        if (
            !name ||
            !mobile ||
            !whatsapp ||
            !studentClass ||
            !medium
        ) {
            alert("Please fill all fields.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            alert("Please enter a valid Mobile Number.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(whatsapp)) {
            alert("Please enter a valid WhatsApp Number.");
            return;
        }

        try {

            const response = await fetch("/api/trial", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name,

                    mobile,

                    whatsapp,

                    class: studentClass,

                    medium

                })

            });

            const result = await response.json();
            console.log("Trial API Response:", result);

            if (result.success) {

                alert(
                    "🎉 Trial Class Booked Successfully!\n\nOur academic counselor will contact you within 24 hours."
                );

                trialForm.reset();

                closeTrialModal();

            } else {

                alert(result.message);

            }

        } catch (error) {

            console.error(error);

            alert("Server Error. Please try again later.");

        }

    });

}