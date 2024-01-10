
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls;
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

function init(config) {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
	camera.position.z = 2.5;

	// scene

	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight( 0xffffff, 0);
	scene.add( ambientLight );

	let distance = 2;
	let positions = [[distance, 0.0, 0.0],
					[0.0, distance, 0.0],
					[0.0, 0.0, distance]];
	let lights = [];
	for (let pos of positions)  {
		let light = new THREE.PointLight( 0xffffff, 3, 0 );
		light.position.set(...pos);
		scene.add(light);
		lights.push(light);
		const sphereSize = 0.5;
		const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
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

	var loader = new GLTFLoader().setPath( dir );
	loader.load( `${config.model_name}.glb`, function ( gltf )
		{
			let object = gltf.scene;
			scale_to_screen(THREE, object);
			let box = new THREE.Box3().setFromObject( object );
			let center = new THREE.Vector3();
			box.getCenter( center );
			camera.lookAt(center);
			controls.target = center;
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

