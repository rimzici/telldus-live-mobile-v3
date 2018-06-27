/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// @flow

'use strict';

import { apiServer, publicKey, privateKey } from '../../Config';

// TODO: fix this pattern, pass store via component tree
import { getStore } from '../Store/ConfigureStore';

/*
 * When the user authenticates (logging in) the app receives two tokens.
 * One access token and one refresh token. The access token is only valid for a short time. A couple of hours or so.
 * When the access token expires it must be refreshed using the refresh token.
 *
 * Since it is currently not possible to know when it expires the app tries to use it until it receives an error.
 * When it receives the error it refreshes the access token and then retries the original call.
 *
 * The validity of the refresh token is about a year or so and will be renewed when used.
 */

export function LiveApi({ url, requestParams }: {url: string, requestParams: Object}): Promise<any> {
	return new Promise((resolve: Function, reject: Function): Promise<any> => {
		return doApiCall(url, requestParams).then((response: Object): any => {
			if (!response) {
				return reject(new Error('unexpected error: response empty'));
			}
			resolve(response);
		}).catch((error: Object): any => {
			if (error.message === 'invalid_token' || error.message === 'expired_token') {
				const store = getStore();
				const { dispatch } = store;
				return dispatch({
					type: 'LOCK_SESSION',
				});
			}
			reject(error);
		});
	});
}

async function doApiCall(url: string, requestParams: Object): any {
	let response = await callEndPoint(url, requestParams, null);
	if (!response.error) {
		// All is well, so return the data from the API.
		return response;
	}
	if (response.error !== 'invalid_token' && response.error !== 'expired_token') {
		// An error from the API we cannot recover from
		throw new Error(response.error);
	}

	response = await refreshAccessToken(url, requestParams); // Token has expired, so we'll try to get a new one.

	response = await callEndPoint(url, requestParams, response); // retry api call
	if (!response.error) {
		// All is well, so return the data from the API.
		return response;
	}

	throw new Error(response.error);
}

async function callEndPoint(url: string, requestParams: Object, token: ?Object = null): Object {
	const accessToken = token ? token : getStore().getState().user.accessToken;
	let params = {};

	if (!accessToken) {
		throw new Error('LiveApi: need accessToken');
	}

	if (requestParams.headers) {
		const headers = { ...requestParams.headers, 'Authorization': `Bearer ${accessToken.access_token}` };
		params = { ...requestParams, headers };
	} else {
		params = Object.assign({}, requestParams, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken.access_token}`,
			},
		});
	}

	let response = await fetch(`${apiServer}/oauth2${url}`, params);
	response = await response.text();
	return JSON.parse(response);
}

// create new token with refresh token
export async function refreshAccessToken(url?: string = '', requestParams?: Object = {}): any {
	const store = getStore();
	const accessToken = store.getState().user.accessToken;
	const { dispatch } = store;

	return fetch(`${apiServer}/oauth2/accessToken`, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			'client_id': publicKey,
			'client_secret': privateKey,
			'grant_type': 'refresh_token',
			'refresh_token': accessToken.refresh_token,
		}),
	})
		.then((response: Object): any => response.json())
		.then((response: Object): any => {
			if (response.error) {
				// We couldn't get a new access token with the refresh_token, so we lock the session.
				dispatch({
					type: 'LOCK_SESSION',
				});
				throw response;
			}
			// import 'updateAccessToken' fails on doing module.exports from Actions/Login'
			// works on exporting 'updateAccessToken' directly(cant be do as there are multiple exports already). need to investigate.
			dispatch({
				type: 'RECEIVED_ACCESS_TOKEN',
				accessToken: response,
			});
			return response;
		}).catch((err: any) => {
			throw err;
		});
}
