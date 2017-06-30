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
 * @providesModule ScheduleNavigator
 */

// @flow

'use strict';

import React from 'react';
import { StackNavigator } from 'react-navigation';
import AddSchedule from './AddSchedule';

const RouteConfigs = {
	Device: {
		screen: ({ navigation }) => <AddSchedule index={0} navigation={navigation}/>,
	},
	Action: {
		screen: ({ navigation }) => <AddSchedule index={1} navigation={navigation}/>,
	},
	Time: {
		screen: ({ navigation }) => <AddSchedule index={2} navigation={navigation}/>,
	},
	Days: {
		screen: ({ navigation }) => <AddSchedule index={3} navigation={navigation}/>,
	},
	Summary: {
		screen: ({ navigation }) => <AddSchedule index={4} navigation={navigation}/>,
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Device',
	headerMode: 'none',
};

const ScheduleNavigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

module.exports = ScheduleNavigator;
