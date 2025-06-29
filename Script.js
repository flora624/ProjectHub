document.addEventListener('DOMContentLoaded', () => {
    const projectListContainer = document.getElementById('project-list-container');
    const modal = document.getElementById('project-modal');
    const closeModalButton = document.querySelector('.close-button');
    let projectsData = [];

    // Fetch projects from our backend API
    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            projectsData = await response.json();
            displayProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectListContainer.innerHTML = '<p>Could not load projects. Please try again later.</p>';
        }
    }

    // Display projects as cards on the page
    function displayProjects(projects) {
        projectListContainer.innerHTML = ''; // Clear existing content
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.dataset.projectId = project.id; // Store project ID in a data attribute

            card.innerHTML = `
                <h3>${project.title}</h3>
                <div class="project-card-meta">
                    <span>${project.domain}</span>
                    <span class="tag">${project.difficulty}</span>
                </div>
            `;
            
            card.addEventListener('click', () => openModal(project.id));
            projectListContainer.appendChild(card);
        });
    }

    // Open the modal and populate it with project details
    function openModal(projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (!project) return;

        document.getElementById('modal-title').textContent = project.title;
        document.getElementById('modal-domain').textContent = project.domain;
        document.getElementById('modal-difficulty').textContent = project.difficulty;
        document.getElementById('modal-problem').textContent = project.problemStatement;
        
        const objectivesList = document.getElementById('modal-objectives');
        objectivesList.innerHTML = project.objectives.map(obj => `<li>${obj}</li>`).join('');
        
        const deliverablesList = document.getElementById('modal-deliverables');
        deliverablesList.innerHTML = project.deliverables.map(del => `<li>${del}</li>`).join('');
        
        const skillsContainer = document.getElementById('modal-skills');
        skillsContainer.innerHTML = project.skills.map(skill => `<span class="tag">${skill}</span>`).join('');

        modal.style.display = 'block';
    }

    // Close the modal
    function closeModal() {
        modal.style.display = 'none';
    }

    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initial fetch
    fetchProjects();
});
