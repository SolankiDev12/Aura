import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { auth, database } from '../firebase'; // Ensure auth is imported
import { ref, update, get } from 'firebase/database';

const PollItem = ({ poll, groupId, onVote, onPollEnd }) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [isPollEnded, setIsPollEnded] = useState(false);
    const [countdownAnimation] = useState(new Animated.Value(1));
    const [voteCounts, setVoteCounts] = useState({});
    const [userVote, setUserVote] = useState(null);

    useEffect(() => {
        const endTime = new Date(poll.expiresAt).getTime();
        const updateRemainingTime = () => {
            const now = Date.now();
            const timeLeft = endTime - now;
            if (timeLeft <= 0) {
                setIsPollEnded(true);
                clearInterval(timer);
                onPollEnd();
                return;
            }
            setRemainingTime(timeLeft);
        };

        const timer = setInterval(updateRemainingTime, 1000);
        updateRemainingTime(); // Initial call to set state

        return () => clearInterval(timer);
    }, [poll, onPollEnd]);

    useEffect(() => {
        Animated.timing(countdownAnimation, {
            toValue: isPollEnded ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isPollEnded]);

    useEffect(() => {
        const fetchVotes = async () => {
            const votesRef = ref(database, `groups/${groupId}/messages/${poll.id}/votes`);
            const votesSnapshot = await get(votesRef);
            const votesData = votesSnapshot.val() || {};

            setVoteCounts(votesData);

            // Check if user has voted
            const user = auth.currentUser;
            if (user) {
                setUserVote(votesData[user.uid]);
            }
        };

        fetchVotes();
    }, [poll.id, groupId]);

    const handleVote = async (optionIndex) => {
        if (!isPollEnded) {
            const user = auth.currentUser;

            // Validate if user is authenticated
            if (!user) {
                console.error('User is not authenticated');
                return;
            }

            const votesRef = ref(database, `groups/${groupId}/messages/${poll.id}/votes`);

            // Update the vote structure to avoid invalid characters
            const voteData = {
                [`${user.uid}`]: optionIndex,
            };

            try {
                await update(votesRef, voteData); // Update votes in the database
                setUserVote(optionIndex); // Update user vote locally
                onVote(optionIndex); // Optionally trigger parent vote handler
            } catch (error) {
                console.error('Error voting:', error);
            }
        }
    };

    const formatTimeLeft = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
    };

    // Moved the countVotes function here
    const countVotes = (votes, optionIndex) => {
        return Object.values(votes).filter(vote => vote === optionIndex).length;
    };

    const totalVotes = Object.keys(voteCounts).length;
    const yesVotes = countVotes(voteCounts, 0);
    const noVotes = countVotes(voteCounts, 1);

    const calculatePercentage = (count) => (totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0);

    return (
        <Animated.View style={{ opacity: countdownAnimation }}>
            <View className="bg-gray-800 rounded-lg p-4 mb-3">
                <Text className="text-white text-lg font-bold">{poll.question}</Text>
                <Text className="text-gray-400 text-sm mb-2">
                    {isPollEnded ? 'Poll ended' : `Ends in: ${formatTimeLeft(remainingTime)}`}
                </Text>
                <View className="mt-2">
                    {poll.options.map((option, index) => (
                        <TouchableOpacity 
                            key={index} 
                            onPress={() => handleVote(index)} 
                            className={`bg-gray-700 rounded-lg py-3 mb-2 ${
                                userVote === index ? 'bg-gray-600' : ''
                            } ${isPollEnded ? 'opacity-60' : ''}`}
                            disabled={isPollEnded}
                        >
                            <Text className="text-white text-base">{option}</Text>
                            {isPollEnded && (
                                <View className="flex flex-row justify-between mt-1 px-2">
                                    <Text className="text-gray-400 text-sm">
                                        {voteCounts ? (voteCounts[`${index}`] || 0) : 0} votes
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {calculatePercentage(voteCounts ? (voteCounts[`${index}`] || 0) : 0)}%
                                    </Text>
                                </View>
                            )}
                            {isPollEnded && (
                                <View className="h-1 bg-gray-600 rounded mt-1">
                                    <View style={{ 
                                        height: '100%', 
                                        backgroundColor: 'green', 
                                        borderRadius: '9999px',
                                        width: `${calculatePercentage(voteCounts ? (voteCounts[`${index}`] || 0) : 0)}%`
                                    }} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
};

export default PollItem;