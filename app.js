// Инициализация сцены
let scene, camera, renderer, model;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Параметры вращения с инерцией
let rotationVelocity = 0;
let targetRotation = 0;
const rotationDamping = 0.95; // Затухание инерции (0.95 = плавное затухание)
const rotationSensitivity = 0.005;

// Параметры зума
let cameraDistance = 5;
const minDistance = 2.5;
const maxDistance = 8;
const zoomSpeed = 0.1;
const zoomSensitivity = 0.02;

// Для pinch жеста
let initialPinchDistance = 0;
let initialCameraDistance = 5;

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
    updateCameraPosition();
    
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
    
    // Загрузка модели
    loadModel();
    
    // Обработчики событий
    setupEventListeners();
    
    // Анимация
    animate();
}

// Обновление позиции камеры
function updateCameraPosition() {
    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = cameraDistance;
    camera.lookAt(0, 1.5, 0);
}

// Загрузка 3D модели
function loadModel() {
    const loader = new THREE.GLTFLoader();
    const loadingDiv = document.getElementById('loading');
    
    // Показываем индикатор загрузки
    loadingDiv.style.display = 'block';
    
    // Путь к модели - замените на ваш файл
    const modelPath = 'models/model.glb'; // или 'models/model.gltf'
    
    loader.load(
        modelPath,
        function(gltf) {
            model = gltf.scene;
            
            // Центрируем модель
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Масштабируем модель, если она слишком большая или маленькая
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 1.5 / maxDimension; // Делаем модель немного меньше, чтобы не выходила за границы
            model.scale.multiplyScalar(scale);
            
            // Центрируем по центру сцены
            model.position.sub(center.multiplyScalar(scale));
            model.position.y = 0;
            
            // Включаем тени для всех мешей
            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(model);
            loadingDiv.style.display = 'none';
        },
        function(progress) {
            // Прогресс загрузки (опционально)
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log('Загрузка: ' + percent + '%');
        },
        function(error) {
            console.error('Ошибка загрузки модели:', error);
            console.error('Путь к модели:', modelPath);
            loadingDiv.innerHTML = '<p style="color: red;">Ошибка загрузки модели: ' + (error.message || 'Неизвестная ошибка') + '<br>Проверьте путь: ' + modelPath + '</p>';
        }
    );
}

// Обработчики событий
function setupEventListeners() {
    const canvas = renderer.domElement;
    
    // Мышь - вращение
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    
    // Колесико мыши - зум
    canvas.addEventListener('wheel', onWheel, { passive: false });
    
    // Сенсорные устройства
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    
    // Изменение размера окна
    window.addEventListener('resize', onWindowResize);
}

// Обработка мыши
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
    rotationVelocity = 0; // Сбрасываем инерцию при новом захвате
}

function onMouseMove(event) {
    if (!isDragging || !model) return;
    
    const deltaX = event.clientX - previousMousePosition.x;
    
    // Вращение только по горизонтали (Y-ось)
    const rotationDelta = deltaX * rotationSensitivity;
    targetRotation += rotationDelta;
    rotationVelocity = rotationDelta; // Сохраняем скорость для инерции
    
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() {
    isDragging = false;
}

// Зум колесиком мыши
function onWheel(event) {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    cameraDistance += delta;
    
    // Ограничиваем зум
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
    
    updateCameraPosition();
}

// Обработка сенсорных устройств
function onTouchStart(event) {
    if (event.touches.length === 1) {
        // Одно касание - вращение
        isDragging = true;
        previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        rotationVelocity = 0;
    } else if (event.touches.length === 2) {
        // Два касания - зум (pinch)
        isDragging = false;
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        initialCameraDistance = cameraDistance;
    }
}

function onTouchMove(event) {
    event.preventDefault();
    
    if (!model) return;
    
    if (event.touches.length === 1 && isDragging) {
        // Вращение одним пальцем
        const deltaX = event.touches[0].clientX - previousMousePosition.x;
        const rotationDelta = deltaX * rotationSensitivity;
        targetRotation += rotationDelta;
        rotationVelocity = rotationDelta;
        
        previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.touches.length === 2) {
        // Зум двумя пальцами (pinch)
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        const pinchDelta = (initialPinchDistance - currentPinchDistance) * zoomSensitivity;
        cameraDistance = initialCameraDistance + pinchDelta;
        
        // Ограничиваем зум
        cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
        
        updateCameraPosition();
    }
}

function onTouchEnd(event) {
    if (event.touches.length === 0) {
        isDragging = false;
    } else if (event.touches.length === 1) {
        // Если остался один палец, переключаемся на режим вращения
        isDragging = true;
        previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Анимационный цикл с инерцией
function animate() {
    requestAnimationFrame(animate);
    
    if (model) {
        // Применяем инерцию к вращению
        if (!isDragging && Math.abs(rotationVelocity) > 0.001) {
            targetRotation += rotationVelocity;
            rotationVelocity *= rotationDamping; // Затухание
        }
        
        // Плавное вращение к целевому углу
        const currentRotation = model.rotation.y;
        const rotationDiff = targetRotation - currentRotation;
        
        // Нормализуем угол в диапазон [-PI, PI]
        let normalizedDiff = rotationDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
        while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
        
        // Плавная интерполяция
        model.rotation.y += normalizedDiff * 0.1;
    }
    
    renderer.render(scene, camera);
}

// Инициализация при загрузке
init();
