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

import { utils } from 'live-shared-data';
const { deviceUtils } = utils;

import i18n from '../Translations/common';

const getAvailableDeviceTypesAndInfo = (formatMessage: () => string): Object => {
	return {
		'zwave': [
			{
				h1: 'Z-Wave',
				h2: formatMessage(i18n.infoZWave),
				module: 'zwave',
				action: 'addNodeToNetwork',
			},
			{
				h1: 'Z-Wave Secure',
				h2: formatMessage(i18n.infoZWaveSec),
				module: 'zwave',
				action: 'addSecureNodeToNetwork',
			},
		],
	};
};

module.exports = {
	...deviceUtils,
	getAvailableDeviceTypesAndInfo,
};
