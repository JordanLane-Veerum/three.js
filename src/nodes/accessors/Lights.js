import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { cameraViewMatrix } from './Camera.js';
import { positionWorld } from './Position.js';

let uniformsLib;

function getLightData( light ) {

	uniformsLib = uniformsLib || new WeakMap();

	let uniforms = uniformsLib.get( light );

	if ( uniforms === undefined ) uniformsLib.set( light, uniforms = {} );

	return uniforms;

}

export function lightShadowMatrix( light ) {

	const data = getLightData( light );

	return data.shadowMatrix || ( data.shadowMatrix = uniform( 'mat4' ).setGroup( renderGroup ).onRenderUpdate( () => {

		if ( light.castShadow !== true ) {

			light.shadow.updateMatrices( light );

		}

		return light.shadow.matrix;

	} ) );

}

export function lightProjectionUV( light ) {

	const data = getLightData( light );

	if ( data.projectionUV === undefined ) {

		const spotLightCoord = lightShadowMatrix( light ).mul( positionWorld );

		data.projectionUV = spotLightCoord.xyz.div( spotLightCoord.w );


	}

	return data.projectionUV;

}

export function lightPosition( light ) {

	const data = getLightData( light );

	return data.position || ( data.position = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.matrixWorld ) ) );

}

export function lightTargetPosition( light ) {

	const data = getLightData( light );

	return data.targetPosition || ( data.targetPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.target.matrixWorld ) ) );

}

export function lightViewPosition( light ) {

	const data = getLightData( light );

	return data.viewPosition || ( data.viewPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => {

		self.value = self.value || new Vector3();
		self.value.setFromMatrixPosition( light.matrixWorld );

		self.value.applyMatrix4( camera.matrixWorldInverse );

	} ) );

}

export const lightTargetDirection = ( light ) => cameraViewMatrix.transformDirection( lightPosition( light ).sub( lightTargetPosition( light ) ) );
