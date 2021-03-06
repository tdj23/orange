var clock;
var scene, camera, renderer;
var geometry, material, mesh;
var havePointerLock = checkForPointerLock();
var controls, controlsEnabled;
var moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    canJump;
var velocity = new THREE.Vector3();
var loader = new THREE.JSONLoader();
var raycaster = new THREE.Raycaster();
var isOpenable = true; //for animating door
var arrow; //for raycasterhelper
var mirrorMaterial;
var mirror_cameras = new Array();
var mirror_materials= new Array();
var u = 0; //number of rendered mirrors
var lastObject = new THREE.Object3D();//for pausing raycaster updates
var frustum = new THREE.Frustum(); //needed for proximityDetection - reset of lastObject
var cam_matrix = new THREE.Matrix4(); //needed for proximityDetection - reset of lastObject
var collidableMeshList = [];
var loadDone, toWakeUp = false;
var animationLock = false; // needed to complete animations before selection next object
var botBody, botArms, botRotateCounter, patrolStatus, botAggressive, botArmStatus, botHit, hitDirection, rotationActive;

var collided = false;
var meshes = new Map();
var rootCell;
var prisonWallRoot;

function init() { 
	
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.domElement.id = "scene";
	renderer.setSize(window.innerWidth, window.innerHeight-30);
	renderer.setClearColor(0xb2e1f2);
	//renderer.shadowMap.enabled = true;
	renderer._microCache = new MicroCache();

	document.body.appendChild(renderer.domElement);
	
	
	THREE.DefaultLoadingManager.onLoad = function () {
		console.log("finished loading");
    	loadDone = true;
    	
	};

	
	//needed for controls
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog(0xb2e1f2, 0, 750);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    
    var material = new THREE.LineBasicMaterial({ color: 0xAAFFAA });

	// crosshair size
	var x = 0.01, y = 0.02;
	
	var geometry = new THREE.Geometry();
	var geometry2 = new THREE.Geometry();
	
	// crosshair
	geometry.vertices.push(new THREE.Vector3(0.01, y, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
	geometry.vertices.push(new THREE.Vector3(-0.01, y, 0));    
	geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
	

	
	var crosshair = new THREE.LineSegments( geometry, material );
	
	// place it in the center
	var crosshairPercentX = 50;
	var crosshairPercentY = 50;
	var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
	var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;
	
	crosshair.position.x = crosshairPositionX * camera.aspect;
	crosshair.position.y = crosshairPositionY;

	
	crosshair.position.z = -0.3;
	camera.add( crosshair );
	camera.position.z = 1;
	

	patrolStatus = 0;
	hitDirection = 1;
	rotationActive = 0;

	initControls();
    initPointerLock();

	controls = new THREE.PointerLockControls(camera);
	
	controls.getObject().position.set(5, 5, 8);

	scene.add(controls.getObject());

	botBody = new JailBotBody();
	botBody.position.set(1.25,2.5,22);
	botBody.rotation.y =  Math.PI*0.5;
	scene.add(botBody);

	botArms = new JailBotArms();
	botArms.position.set(1.25,2.5,22);
	botArms.rotation.y =  Math.PI*0.5;
	scene.add(botArms);
	
	botArmStatus = 0;
	botHit = 0;
	botAggressive = 0;

	//add prison hallway
	var hallway = new Hallway();
	hallway.position.set(0,0,21);
	scene.add(hallway);
	
	rootCell = new PrisonCell();
	rootCell.position.set(0,0,0);
	scene.add(rootCell);
	//showCameraHelpers();
	
	var grid = new THREE.GridHelper(500, 5);
	prisonWallRoot = new PrisonWall();
	prisonWallRoot.rotation.y += Math.PI/2;
	addWall();
	addTowers();
	scene.add(grid); 
	
	
	//createSandFloor();
	sun();
	animate();	
}

function addWall() {
	var y = 3.7;
	prisonWallRoot.rotation.y += Math.PI;
	for (i = -3; i < 5; i++) { 
		var prisonWall = prisonWallRoot.clone();
		prisonWall.position.set(i*16+7,y,-50);
		scene.add(prisonWall);
	}
	prisonWallRoot.rotation.y += Math.PI/2;
	for (i = -3; i < 4; i++) { 
		var prisonWall = prisonWallRoot.clone();
		prisonWall.position.set(-50,y,i*16+7);
		scene.add(prisonWall);
	}
	prisonWallRoot.rotation.y -= Math.PI/2;
	for (i = -3; i < 5; i++) { 
		var prisonWall = prisonWallRoot.clone();
		prisonWall.position.set(i*16+7,y,60);
		scene.add(prisonWall);
	}
	prisonWallRoot.rotation.y -= Math.PI/2;
	for (i = -3; i < 4; i++) { 
		var prisonWall = prisonWallRoot.clone();
		prisonWall.position.set(80,y,i*16+7);
		scene.add(prisonWall);
	}
}


function addTowers() {
	var tower = new Tower();
	tower.position.set(-50,0,-50);	
	scene.add(tower);
	
	var tower = new Tower();
	tower.position.set(80,0,-50);	
	scene.add(tower);
	
	var tower = new Tower();
	tower.position.set(80,0,60);	
	scene.add(tower);
	
	var tower = new Tower();
	tower.position.set(-50,0,60);	
	scene.add(tower);
}


function sun(){
	//let the sun shine in, leeeeeet the sunshine
	var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	var dirLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	var dirLight3 = new THREE.DirectionalLight( 0xffffff, 0.5 );

	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 20, 20, 20 );
	
	dirLight2.color.setHSL( 0.1, 1, 0.95 );
	dirLight2.position.set( -40, 40, 0 );
	
	dirLight3.color.setHSL( 0.1, 1, 0.95 );
	dirLight3.position.set( 0, 40, -40 );
	
	
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;

	var d = 50;

	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;

	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	//dirLight.shadowCameraVisible = true;
	dirLight.castShadow = true;
	
	scene.add(dirLight3);
	scene.add(dirLight2);
	scene.add(dirLight);			
	
}
function createSandFloor() {
	var sand = new Sand();
	sand.position.set(100, -5, 100);
	scene.add(sand);
}

function cloning(n) {
	for (i = 1; i < n; i++) { 
		
		var newCell = rootCell.clone();
		newCell.position.set(i*11.55,0,0);
		scene.add(newCell);
	}
	
	for (j = 1; j < n+1; j++) { 
		var newCell = rootCell.clone();
		newCell.rotation.y =  Math.PI;
		newCell.position.set(j*11.55,0,41.5);
		scene.add(newCell);
	}
}


function showCameraHelpers(){
	//scene.add( new THREE.CameraHelper(camera)); //main camera
	for (j = 0; j < mirror_cameras.length ; j++) { 
    	scene.add( new THREE.CameraHelper( mirror_cameras[j]) ); //mirror cameras
	}
}


function updateMirrors() { //update mirrors/materials
	//u = 0; 
	var d = 10; //+- position of camera 
	var cx= controls.getObject().position.x; //get current x-coordinate from world camera
	for (j = 0; j < mirror_cameras.length ; j++) { 
			enableMirrors(cx-d,cx+d); //enable and render only mirrors near world camera
	    }
	//console.log("mirrors: " + u);
	}
	
function enableMirrors(x1,x2){ //enable mirros that are between given x-axis coordinates
	    var p = mirror_cameras[j].localToWorld(new THREE.Vector3(location.x, location.y, location.z));
    	if(p.x >= x1 & p.x <= x2){
    		//controls.getObject().updateMatrixWorld();
			//var rx= controls.getObject().rotation.y;
			var rx= controls.getObject().position.z;
			var rr =  ((rx/10) * Math.PI);
			mirror_cameras[j].rotation.set(0, rr,0 );
   			mirror_cameras[j].updateMatrix();
    		mirror_cameras[j].updateProjectionMatrix(); //update
    		renderer.render( scene, mirror_cameras[j], mirror_materials[j], true );	
    		//u++;
    	}
}

function animate() {
	
	requestAnimationFrame(animate); 
	if (loadDone) {

 		updateMirrors();
	    renderer.render(scene, camera);
	    
	 	proximityDetector();
	 	animateDoors();
 		

	 	animateDrop(lastObject);
		patrolRobot();
 	
		if(botAggressive == 1)
			{
				robotAttack();
			}	 	
	 	} 
		updateControls();
 		camera.updateProjectionMatrix();

}


function zoom(){
	if(camera.zoom == 4)
		camera.zoom = 1;
	else
		camera.zoom = 4;
}

function showMessage(text){
	document.getElementById("message").innerHTML=text;
}
