import { PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from '@chakra-ui/react';
import React from 'react'

interface FriendPopUpProps {

}

const FriendPopUp: React.FC<FriendPopUpProps> = ({ }) => {
    return (
        <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
    );
}

export default FriendPopUp;