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
 */

// @flow

'use strict';

import React from 'react';
import Modal from 'react-native-modal';

import { View, StyleSheet, DialogueHeader } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

type Props = {
    showModal: boolean,
	buttons: Array<Object>,
	name: string,
	closeModal: () => void;
};

export default class MultiActionModal extends View<Props, null> {
props: Props;

closeModal: () => void;

constructor(props: Props) {
	super();

	this.closeModal = this.closeModal.bind(this);
}

closeModal() {
	let { closeModal } = this.props;
	if (closeModal) {
		closeModal();
	}
}

render(): Object {
	let { showModal, buttons, name } = this.props;

	return (
		<Modal
			isVisible={showModal}
			style={styles.modal}
			backdropOpacity={0.60}
			supportedOrientations={['portrait', 'landscape']}>
			<View style={styles.modalCover}>
				<DialogueHeader
					headerText={name}
					showIcon={true}
					headerStyle={styles.headerStyle}
					onPressIcon={this.closeModal}/>
				<View style={styles.body}>
					{React.Children.map(buttons, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							return (
								<View style={{ paddingTop: 5 }}>
									{React.cloneElement(child)}
								</View>
							);
						}
						return null;
					})
					}
				</View>
			</View>
		</Modal>
	);
}
}


const padding = 10;
const styles = StyleSheet.create({
	modal: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalCover: {
		flex: 0,
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: '#fff',
		width: (Theme.Core.buttonWidth * 3) + (padding * 2),
	},
	body: {
		flexDirection: 'column-reverse',
		alignItems: 'flex-start',
		justifyContent: 'center',
		paddingVertical: padding,
		paddingHorizontal: padding,
	},
	headerStyle: {
		paddingVertical: padding,
		paddingHorizontal: padding,
		width: '100%',
	},
	headerText: {
		color: '#000',
	},
});