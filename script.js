document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const cards = document.querySelectorAll('.card-3d');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('ph-list');
            icon.classList.toggle('ph-x');
        });

        // Close menu when link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.add('ph-list');
                icon.classList.remove('ph-x');
            });
        });
    }

    // Custom Cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 3D Tilt Effect
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });

    // Scroll Reveal
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // Three.js 3D Scene
    const initThree = () => {
        const container = document.getElementById('three-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create an "Atom" like structure
        const group = new THREE.Group();
        
        // Nucleus
        const nucleusGeo = new THREE.SphereGeometry(1, 32, 32);
        const nucleusMat = new THREE.MeshPhongMaterial({ 
            color: 0x003366, // Navy
            emissive: 0x003366, 
            emissiveIntensity: 0.2,
            shininess: 100
        });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
        group.add(nucleus);

        // Electrons orbits
        const createOrbit = (rotation) => {
            const orbitGeo = new THREE.TorusGeometry(3, 0.02, 16, 100);
            const orbitMat = new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.2 }); // Orange
            const orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = rotation.x;
            orbit.rotation.y = rotation.y;
            
            // Electron
            const electronGeo = new THREE.SphereGeometry(0.15, 16, 16);
            const electronMat = new THREE.MeshPhongMaterial({ color: 0xFF6600, emissive: 0xFF6600 }); // Orange
            const electron = new THREE.Mesh(electronGeo, electronMat);
            
            const pivot = new THREE.Group();
            pivot.rotation.x = rotation.x;
            pivot.rotation.y = rotation.y;
            pivot.add(electron);
            electron.position.set(3, 0, 0);
            
            return { orbit, pivot };
        };

        const orbits = [
            createOrbit({ x: Math.PI / 2, y: 0 }),
            createOrbit({ x: Math.PI / 4, y: Math.PI / 4 }),
            createOrbit({ x: -Math.PI / 4, y: Math.PI / 4 })
        ];

        orbits.forEach(o => {
            group.add(o.orbit);
            group.add(o.pivot);
        });

        scene.add(group);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        camera.position.z = 6;

        const animate = () => {
            requestAnimationFrame(animate);
            group.rotation.y += 0.005;
            group.rotation.x += 0.002;
            
            orbits.forEach((o, i) => {
                o.pivot.rotation.z += 0.03 * (i + 1);
            });

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    };

    initThree();
});
