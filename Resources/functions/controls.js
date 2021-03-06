function initControls() {
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
}

function onKeyDown(e) {
    switch (e.keyCode) {
		case 32: // space
		    if (canJump === true) velocity.y += 50;
		    canJump = false;
		    break;
		case 37: // left
    	case 38: // up
		case 39: // right
		case 40: // down
		
		case 65: // a
			moveLeft = true; 
			break;
		case 66: //b
			{
			if(botAggressive == 0)
			{
				botAggressive = 1;
			}
			
			else 
			{
				botAggressive = 0;
			}
			}
			break;
		case 68: // d
    		moveRight = true;
    		break;	
		case 69: // e
	 		rotate(lastObject,new THREE.Vector3(0,1,0),-5); //object,axis,degree
    		break;
		case 79: //o
			botAggressive = 0;
			break;
		case 81: // q
			rotate(lastObject,new THREE.Vector3(0,1,0),5 ); //object,axis,degree
    		break;
  		case 83: // s
    		moveBackward = true;
    		break;		
		case 84: //t
	    	triggerDoor(lastObject);
	    	switchTableLight(lastObject);	    	
	    	break;
  		case 87: // w
    		moveForward = true;	
    		break;
  		case 89: //y
  			triggerDrop(lastObject);
  			break;
	   	case 90: //z
	   		zoom();
	   		break;
    	}
  }
  


function onKeyUp(e) {
	switch(e.keyCode) {
		case 37: // left
    	case 38: // up
		case 39: // right
	  	case 40: // down
	  	case 65: // a
	    	moveLeft = false;
	    	break;
	  	case 68: // d
	        moveRight = false;
	        break;
	  	case 83: // s
	    	moveBackward = false;
	    	break;	    
	  	case 87: // w
	    	moveForward = false;
	    	break;
	}
}


function updateControls() {
	if (controlsEnabled) {
		var delta = clock.getDelta();
      	var walkingSpeed = 100.0;
		var toTest = new THREE.Vector3(controls.getObject().position.x, 1, controls.getObject().position.z);


	    if (!collisionDetection(0, 0, toTest)) {
	    	velocity.x -= velocity.x * 10.0 * delta;
		    velocity.z -= velocity.z * 10.0 * delta;
		    velocity.y -= 9.8 * 30.0 * delta;
		    if (moveForward)	velocity.z -= walkingSpeed * delta;
		    if (moveBackward)  velocity.z += walkingSpeed * delta;
		    if (moveLeft) velocity.x -= walkingSpeed * delta;
		    if (moveRight) velocity.x += walkingSpeed * delta;
		} else {
			//if (collided == false){
				//collided = true;
				/*velocity.x = -velocity.x*1.3;
		    	velocity.z = -velocity.z*1.3;*/
		    	if (moveForward && !collisionDetection(0, 1, toTest)) {
		    		velocity.z -= walkingSpeed * delta;
		    	} else {
		    		velocity.z = 0;
		    	}
			    if (moveBackward && !collisionDetection(0, -1, toTest))  {
			    	velocity.z += walkingSpeed * delta; 
			    } else {
		    		velocity.z = 0;
		    	}
			    if (moveLeft && !collisionDetection(1, 0, toTest))  {
			    	velocity.x -= walkingSpeed * delta;
			    } else {
		    		velocity.x = 0;
		    	}
			    if (moveRight && !collisionDetection(-1, 0, toTest))  {
			    	velocity.x += walkingSpeed * delta;
			    } else {
		    		velocity.x = 0;
		    	}
		    	velocity.y -= 9.8 * 30.0 * delta;
			/*} else {
				if (velocity.x == velocity.z == 0) {
					collided = false;
				}
			}*/
		}
	
	    controls.getObject().translateX(velocity.x * delta);
	    controls.getObject().translateY(velocity.y * delta);
	    controls.getObject().translateZ(velocity.z * delta);
	
	    if (controls.getObject().position.y < 4) {
	    	velocity.y = 0;
	        controls.getObject().position.y = 4;
	        canJump = true;
	    }
    }
  }