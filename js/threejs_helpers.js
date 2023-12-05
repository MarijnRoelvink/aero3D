function scale_to_screen(THREE, mesh) {
	const box3 = new THREE.Box3().setFromObject(mesh);

	const size = new THREE.Vector3()
	box3.getSize(size)
	let maxScale = Math.max(box3.max.x - box3.min.x, box3.max.y - box3.min.y, box3.max.z - box3.min.z);
	mesh.scale.setScalar(1 / maxScale);
}