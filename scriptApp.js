const doctors = [
    {
        name: "Dr. Ralph Edwards",
        specialization: "Dermatologist",
        fee: 20,
        experience: "10+ years experience in skin treatment"
    },
    {
        name: "Dr. Ronald Richards",
        specialization: "Neurologist",
        fee: 25,
        experience: "Expert in neurological disorders"
    },
    {
        name: "Dr. Albert Boje",
        specialization: "Dentist",
        fee: 15,
        experience: "Professional dental surgeon"
    },
    {
        name: "Dr. Courtney Henry",
        specialization: "Cardiologist",
        fee: 30,
        experience: "Heart specialist with 12 years experience"
    }
];

const doctorList = document.getElementById("doctorList");
const searchInput = document.getElementById("searchDoctor");
const filterSelect = document.getElementById("filterSpecialization");
const detailBox = document.getElementById("detailContent");

/* Render Doctors */
function renderDoctors(list) {
    doctorList.innerHTML = "";
    list.forEach((doc, index) => {
        const card = document.createElement("div");
        card.classList.add("doctor-card");
        card.innerHTML = `
            <h4>${doc.name}</h4>
            <p>${doc.specialization}</p>
            <p>$${doc.fee}/hour</p>
            <button onclick="viewDetail(${index})">Detail</button>
            <button onclick="bookDoctor('${doc.name}')">Book Now</button>
        `;
        doctorList.appendChild(card);
    });
}

/* Search + Filter */
function filterDoctors() {
    const searchText = searchInput.value.toLowerCase();
    const specialization = filterSelect.value;

    const filtered = doctors.filter(doc => {
        return (
            doc.name.toLowerCase().includes(searchText) &&
            (specialization === "" || doc.specialization === specialization)
        );
    });

    renderDoctors(filtered);
}

searchInput.addEventListener("input", filterDoctors);
filterSelect.addEventListener("change", filterDoctors);

/* View Detail */
window.viewDetail = function(index) {
    const doc = doctors[index];
    detailBox.innerHTML = `
        <h4>${doc.name}</h4>
        <p><strong>Specialization:</strong> ${doc.specialization}</p>
        <p><strong>Fee:</strong> $${doc.fee}/hour</p>
        <p><strong>Experience:</strong> ${doc.experience}</p>
        <button onclick="alert('Chat Started with ${doc.name}')">Chat</button>
    `;
}

/* Book Doctor */
window.bookDoctor = function(name) {
    const date = document.getElementById("appointmentDate").value;
    const selectedTime = document.querySelector(".time-slots .selected");

    if (!date || !selectedTime) {
        alert("Please select date and time");
        return;
    }

    alert(`Appointment booked with ${name}\nDate: ${date}\nTime: ${selectedTime.innerText}`);
}

/* Time Slot Selection */
document.querySelectorAll(".time-slots button").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".time-slots button")
            .forEach(b => b.classList.remove("selected"));
        this.classList.add("selected");
    });
});

renderDoctors(doctors);
