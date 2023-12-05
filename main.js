
import * as THREE from 'three';

import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let dir =  'models/'

route();

function route() {
	let lecture = getUrlQuery("lecture");
	fetch(`lectures/lecture_${lecture}/config.json`)
		.then((response) => response.json())
		.then((json) => {
			init(json);
			animate();
		});
}

function init(config) {

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
	camera.position.z = 2.5;

	// scene

	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight( 0xffffff);
	scene.add( ambientLight );

	const pointLight = new THREE.PointLight( 0xffffff, 60 );
	camera.add( pointLight );
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

	new MTLLoader()
		.setPath( dir )
		.load( `${config.model_name}.mtl`, function ( materials ) {

			materials.preload();

			new OBJLoader()
				.setMaterials( materials )
				.setPath( dir )
				.load( `${config.model_name}.obj`, function ( object ) {
					scale_to_screen(THREE, object);
					let box = new THREE.Box3().setFromObject( object );
					let center = new THREE.Vector3();
					box.getCenter( center );
					camera.lookAt(center);
					controls.target = center;
					scene.add( object );
				}, onProgress );

		} );

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

