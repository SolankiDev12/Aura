// ElectionItem.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ElectionItem = ({ election, onVote }) => {
    return (
        <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <Text className="text-white text-lg font-bold">{election.title}</Text>
            <Text className="text-gray-400 text-sm">{election.description}</Text>
            <View className="mt-2">
                {election.candidates.map((candidate, index) => (
                    <TouchableOpacity 
                        key={index} 
                        onPress={() => onVote(candidate.id)} 
                        className="bg-gray-700 rounded-lg p-2 mb-2"
                    >
                        <Text className="text-white">{candidate.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default ElectionItem;
