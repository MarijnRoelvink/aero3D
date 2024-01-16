
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls, lights, o_center;
let l_distance = 1;
let dir =  'models/'

route();

function route() {
	let model = getUrlQuery("model");
	fetch(`config.json`)
		.then((response) => response.json())
		.then((json) => {
			let config = json.find(item => item.number === model);
			init(config);
			animate();
		});
}

function updateLights() {
	let forward = new THREE.Vector3( );
	let v = getVaxis(THREE, camera);
	camera.getWorldDirection(forward);
	forward.negate()
		.normalize()
		.multiplyScalar(l_distance);

	let key = forward.clone().applyAxisAngle(v, -45.0/360.0*2*Math.PI).add(o_center);
	let fill = forward.clone().applyAxisAngle(v, 45.0/360.0*2*Math.PI).add(o_center);
	lights[0].position.copy(key);
	lights[1].position.copy(fill);
}

function init(config) {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
	camera.position.z = 2.5;

	// scene

	scene = new THREE.Scene();
	
	let light_configs = [{color: 0xffffff, intensity: 3},
		{color: 0xa3aeff, intensity: 2}]
	lights = [];
	for (let l of light_configs)  {
		let light = new THREE.PointLight( l.color, l.intensity, 0 );
		scene.add(light);
		lights.push(light);
		// const sphereSize = 0.1;
		// const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
		// scene.add( pointLightHelper );
	}

	scene.add( camera );

	// model

	const onProgress = function ( xhr ) {

		if ( xhr.lengthComputable ) {

			const percentComplete = xhr.loaded / xhr.total * 100;
			// console.log( percentComplete.toFixed( 2 ) + '% downloaded' );
		}

	};

	//
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	//

	controls = new  OrbitControls( camera, renderer.domElement );
	controls.minDistance = 0.5;
	controls.maxDistance = 5;
	controls.addEventListener('change', updateLights);

	var loader = new GLTFLoader().setPath( dir );
	loader.load( `${config.model_name}.glb`, function ( gltf )
		{
			let object = gltf.scene;
			scale_to_screen(THREE, object);
			let box = new THREE.Box3().setFromObject( object );
			o_center = new THREE.Vector3();
			box.getCenter( o_center );
			controls.target = o_center;
			camera.lookAt(o_center);
			updateLights();
			scene.add( object );
		});

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}

