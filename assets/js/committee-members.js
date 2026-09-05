(function () {
  const COMMITTEE_MEMBERS = [
    // CORE COMMITTEE
    { name: "Chaitanya Shridhar Karekar", committee: "Core Committee", role: "General Secretary" },
    { name: "Harshini M Hawaldarmath", committee: "Core Committee", role: "Ladies Secretary" },
    { name: "Piyush Dalal", committee: "Core Committee", role: "Core Committee" },

    // PRINTING AND DESIGNING COMMITTEE
    { name: "Amogh Betsurmath", committee: "Printing And Designing Committee" },
    { name: "Ramdas Desai", committee: "Printing And Designing Committee" },

    // STAGE COMMITTEE
    { name: "Adi Ijare", committee: "Stage Committee" },
    { name: "Divya Bhandarkar", committee: "Stage Committee" },
    { name: "Vedika Patange", committee: "Stage Committee" },
    { name: "Vani Pujari", committee: "Stage Committee" },
    { name: "Suraj A Nandihalli", committee: "Stage Committee" },

    // DECORATION COMMITTEE
    { name: "Suraj Patil", committee: "Decoration Committee" },
    { name: "Archana Chougule", committee: "Decoration Committee" },
    { name: "Vani Chikki", committee: "Decoration Committee" },
    { name: "Sahana Patil", committee: "Decoration Committee" },
    { name: "Swati Patil", committee: "Decoration Committee" },
    { name: "Aadarsh Hiroji", committee: "Decoration Committee" },
    { name: "Anjali Harikant", committee: "Decoration Committee" },

    // WEBSITE COMMITTEE
    { name: "Irrayya Hiremath", committee: "Website Committee" },
    { name: "Abhishek Duradundi", committee: "Website Committee" },

    // TECHNICAL COMMITTEE
    { name: "Vedant Kundekar", committee: "Technical Committee" },
    { name: "Vedant Bandkar", committee: "Technical Committee" },
    { name: "Omkar Mattikalli", committee: "Technical Committee" },

    // DISCIPLINE COMMITTEE
    { name: "Bhumika Atiwadkar", committee: "Discipline Committee" },
    { name: "Sejal Patil", committee: "Discipline Committee" },
    { name: "Shreya Patil", committee: "Discipline Committee" },
    { name: "Yasira Mulla", committee: "Discipline Committee" },
    { name: "Sneha Bhendigeri", committee: "Discipline Committee" },

    // CATERING COMMITTEE
    { name: "Ketan Khandolkar", committee: "Catering Committee" },
    { name: "Aditya Dalvi", committee: "Catering Committee" },
    { name: "Pratham Raikar", committee: "Catering Committee" },
    { name: "Sanjivani Babiche", committee: "Catering Committee" },
    { name: "Riya Arksali", committee: "Catering Committee" },
    { name: "Siddhi Tarale", committee: "Catering Committee" },
    { name: "Niyaz Jamadar", committee: "Catering Committee" },

    // CODING EVENT
    { name: "Pratiksha G Pujari", committee: "Coding Event" },
    { name: "Trupti Patil", committee: "Coding Event" },
    { name: "Jayvant Kangralkar", committee: "Coding Event" },
    { name: "Shravani Patil", committee: "Coding Event" },
    { name: "Prema Patil", committee: "Coding Event" },
    { name: "Ankush Kadam", committee: "Coding Event" },
    { name: "Anish Bhadange", committee: "Coding Event" },
    { name: "Rohini Goral", committee: "Coding Event" },
    { name: "Manjusha Patil", committee: "Coding Event" },
    { name: "Snehal Maragannache", committee: "Coding Event" },

    // COMMUNICATION EVENT
    { name: "Preeti Agrawale", committee: "Communication Event" },
    { name: "A.Mary Derina", committee: "Communication Event" },
    { name: "Aniket Thorat", committee: "Communication Event" },
    { name: "Tayabba Pathan", committee: "Communication Event" },
    { name: "Suzan Fernandes", committee: "Communication Event" },
    { name: "Amisha Kanbargi", committee: "Communication Event" },
    { name: "Manish Rajpurohit", committee: "Communication Event" },
    { name: "Madhu Desai", committee: "Communication Event" },
    { name: "Swati Biradar", committee: "Communication Event" },

    // CONTENT CREATION EVENT
    { name: "Mahant Muchandikar", committee: "Content Creation Event" },
    { name: "Omkar Mattikalli", committee: "Content Creation Event" },
    { name: "Vaishnavi Kashid", committee: "Content Creation Event" },
    { name: "Tejashwini Puranik", committee: "Content Creation Event" },
    { name: "Umadevi Kamble", committee: "Content Creation Event" },
    { name: "Vidya Umarani", committee: "Content Creation Event" },
    { name: "Vaishnavi C B", committee: "Content Creation Event" },
    { name: "Balajising Rajput", committee: "Content Creation Event" },

    // CYBERSECURITY EVENT
    { name: "John Pinto", committee: "Cybersecurity Event" },
    { name: "Mohammed Rehan Mulla", committee: "Cybersecurity Event" },
    { name: "Kumkum Mitbavkar", committee: "Cybersecurity Event" },
    { name: "Aparna Motre", committee: "Cybersecurity Event" },
    { name: "Pratiksha Kugaji", committee: "Cybersecurity Event" },
    { name: "Netra Patil", committee: "Cybersecurity Event" },
    { name: "Anuja Jadhav", committee: "Cybersecurity Event" },
    { name: "Janhvi Bhogulkar", committee: "Cybersecurity Event" },
    { name: "Aishwarya Gudi", committee: "Cybersecurity Event" },

    // DATA ANALYTICS EVENT
    { name: "Sneha Parishwad", committee: "Data Analytics Event" },
    { name: "Rakshita Patil", committee: "Data Analytics Event" },
    { name: "Madhura Hande", committee: "Data Analytics Event" },
    { name: "Priyanka Hosmani", committee: "Data Analytics Event" },
    { name: "Sanjana Chitti", committee: "Data Analytics Event" },
    { name: "Pradeep Patil", committee: "Data Analytics Event" },
    { name: "Vikram Shaldar", committee: "Data Analytics Event" },
    { name: "Divya Patil", committee: "Data Analytics Event" },
    { name: "Sonali Battuche", committee: "Data Analytics Event" },

    // DESIGNING EVENT
    { name: "Nayana Bagadi", committee: "Designing Event" },
    { name: "Amogh Betsurmath", committee: "Designing Event" },
    { name: "Vaishnavi Manaturagimath", committee: "Designing Event" },
    { name: "Vijeta Chougule", committee: "Designing Event" },
    { name: "Janhavi Kadam", committee: "Designing Event" },
    { name: "Sejal Mane", committee: "Designing Event" },
    { name: "Poorva Mirajkar", committee: "Designing Event" },
    { name: "Sumant Ambekar", committee: "Designing Event" },

    // GAMING EVENT
    { name: "Omkar Bhavani", committee: "Gaming Event" },
    { name: "Sarvesh Patil", committee: "Gaming Event" },
    { name: "Atharva Dixit", committee: "Gaming Event" },
    { name: "Omkar Pavaskar", committee: "Gaming Event" },
    { name: "Shubham Pawar", committee: "Gaming Event" },
    { name: "Akash Soanshet", committee: "Gaming Event" },
    { name: "Ajay Parit", committee: "Gaming Event" },
    { name: "Parth Jadhav", committee: "Gaming Event" },
    { name: "Santosh Kademani", committee: "Gaming Event" },
    { name: "Ramadas Desai", committee: "Gaming Event" },

    // QUIZ EVENT
    { name: "Pradnya Bhandari", committee: "Quiz Event" },
    { name: "Shrinidhi Revankar", committee: "Quiz Event" },
    { name: "Riya Dabholkar", committee: "Quiz Event" },
    { name: "Anannya Patil", committee: "Quiz Event" },
    { name: "Dhanalaxmi Desai", committee: "Quiz Event" },
    { name: "Shubhangi Maruche", committee: "Quiz Event" },
    { name: "Rutuja Basarikatti", committee: "Quiz Event" },
    { name: "Shrusti Kirasur", committee: "Quiz Event" },

    // PROMPT ENGINEERING EVENT
    { name: "Shivani Kakatkar", committee: "Prompt Engineering Event" },
    { name: "Akshatha Vernekar", committee: "Prompt Engineering Event" },
    { name: "Ayaan Shaikh", committee: "Prompt Engineering Event" },
    { name: "Swati Pavaskar", committee: "Prompt Engineering Event" },
    { name: "Bhoomi Tarihal", committee: "Prompt Engineering Event" },
    { name: "Shrish Kulkarni", committee: "Prompt Engineering Event" },
    { name: "Pooja Kakatikar", committee: "Prompt Engineering Event" },
    { name: "Srushti Kudachi", committee: "Prompt Engineering Event" },
    { name: "Chaitra Killiketar", committee: "Prompt Engineering Event" },

    // CULTURAL EVENT (GROUP)
    { name: "Anjali Kamble", committee: "Cultural Event (Group)" },
    { name: "Sakshi Orewale", committee: "Cultural Event (Group)" },
    { name: "Akash Karekar", committee: "Cultural Event (Group)" },
    { name: "Shreya Gawade", committee: "Cultural Event (Group)" },
    { name: "Shravani Deshpande", committee: "Cultural Event (Group)" },
    { name: "Laxmi Rumoji", committee: "Cultural Event (Group)" },
    { name: "Soumya Yadal", committee: "Cultural Event (Group)" },
    { name: "Priya Karaveeranavar", committee: "Cultural Event (Group)" }
  ];

  function renderCommitteeMembers() {
    const container = document.getElementById('committee-members-grid');
    if (!container) return;

    // Group members by committee preserving insertion order
    const groupsMap = new Map();
    COMMITTEE_MEMBERS.forEach(member => {
      if (!groupsMap.has(member.committee)) {
        groupsMap.set(member.committee, []);
      }
      groupsMap.get(member.committee).push(member);
    });

    let html = '';
    groupsMap.forEach((members, committeeName) => {
      html += `
        <div class="event-group-section fade-up visible" style="margin-bottom: 3.5rem;">
          <div class="event-group-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <h3 class="event-group-title" style="
              font-family: var(--font-pirate, 'Georgia', serif);
              font-size: clamp(1.2rem, 3.2vw, 1.75rem);
              color: var(--cyan-200, #a5f3fc);
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin: 0;
              white-space: nowrap;
              text-shadow: 0 0 12px rgba(34, 211, 238, 0.4);
            ">⚓ ${committeeName}</h3>
            <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(34, 211, 238, 0.6) 0%, transparent 100%);"></div>
          </div>
          <div class="students-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;">
            ${members.map(member => `
              <div class="person-card fade-up visible">
                <h3 class="person-name">${member.name}</h3>
                <p class="person-role">${member.role || member.committee}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    if ('IntersectionObserver' in window) {
      const cards = container.querySelectorAll('.fade-up');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });
      cards.forEach(card => observer.observe(card));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCommitteeMembers);
  } else {
    renderCommitteeMembers();
  }
})();
