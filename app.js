// Инициализация сцены
let scene, camera, renderer, model;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Создание сцены
function init() {
    const container = document.getElementById('canvas-container');
    
    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Камера
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 3);
    
    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Создание простой 3D модели девушки из примитивов
    createSimpleGirl();
    
    // Обработчики событий
    setupEventListeners();
    
    // Анимация
    animate();
}

// Создание простой модели девушки из примитивов
function createSimpleGirl() {
    const group = new THREE.Group();
    
    // Голова
    const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.4, 0);
    head.castShadow = true;
    group.add(head);
    
    // Тело (торс)
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b9d });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.0, 0);
    body.castShadow = true;
    group.add(body);
    
    // Грудь
    const chestGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const chestMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b9d });
    const chest1 = new THREE.Mesh(chestGeometry, chestMaterial);
    chest1.position.set(-0.1, 1.15, 0.1);
    chest1.castShadow = true;
    group.add(chest1);
    
    const chest2 = new THREE.Mesh(chestGeometry, chestMaterial);
    chest2.position.set(0.1, 1.15, 0.1);
    chest2.castShadow = true;
    group.add(chest2);
    
    // Руки
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 32);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    
    // Левая рука
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.25, 1.0, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    group.add(leftArm);
    
    // Правая рука
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.25, 1.0, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Ноги
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 32);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
    
    // Левая нога
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.1, 0.3, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    // Правая нога
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.1, 0.3, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    // Волосы
    const hairGeometry = new THREE.SphereGeometry(0.22, 32, 32);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.5, -0.05);
    hair.scale.set(1, 1.2, 1.1);
    hair.castShadow = true;
    group.add(hair);
    
    // Платформа
    const platformGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0;
    platform.receiveShadow = true;
    scene.add(platform);
    
    model = group;
    scene.add(group);
}

// Обработчики событий для вращения
function setupEventListeners() {
    const canvas = renderer.domElement;
    
    // Мышь
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    
    // Сенсорные устройства
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);
    
    // Изменение размера окна
    window.addEventListener('resize', onWindowResize);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
    if (!isDragging || !model) return;
    
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() {
    isDragging = false;
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
}

function onTouchMove(event) {
    if (!isDragging || !model || event.touches.length !== 1) return;
    
    event.preventDefault();
    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;
    
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;
    
    previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function onTouchEnd() {
    isDragging = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Анимационный цикл
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Инициализация при загрузке
init();


