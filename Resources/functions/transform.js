// rotate object around own axis
function rotate(object, axis, angle) { 
	if(object.userData.rotatable == true){
	    var quaternion = new THREE.Quaternion();
	    quaternion.setFromAxisAngle(axis, angle);
	    object.quaternion.multiply(quaternion);
   }
}  