import React from 'react';
import { View, FlatList } from 'react-native';
import ChatItem from '../components/ChatItem';
import PollItem from '../components/PollItem';
import ChatDateSeparator from './ChatDateSeparator';
import { auth, database } from '../firebase'; // Ensure firebase is imported
import { ref, update, get, push } from 'firebase/database';

const MessageList = ({ messages, groupMembers, flatListRef, groupId }) => {
    const getFormattedDate = (date) => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (date.toDateString() === today) return 'Today';
        if (date.toDateString() === yesterday) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const groupMessagesByDate = () => {
        let currentDate = '';
        const groups = [];
        let currentGroup = [];

        messages.forEach((message) => {
            const messageDate = new Date(message.timestamp);
            const formattedDate = getFormattedDate(messageDate);

            if (formattedDate !== currentDate) {
                if (currentGroup.length > 0) {
                    groups.push({ date: currentDate, messages: currentGroup });
                }
                currentDate = formattedDate;
                currentGroup = [message];
            } else {
                currentGroup.push(message);
            }
        });

        if (currentGroup.length > 0) {
            groups.push({ date: currentDate, messages: currentGroup });
        }

        return groups;
    };

    const handleVote = async (pollId, optionIndex) => {
        const user = auth.currentUser;
        const pollRef = ref(database, `groups/${groupId}/messages/${pollId}`);
        
        try {
            await update(pollRef, {
                [`${user.uid}`]: optionIndex,
            });
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handlePollEnd = async (pollId) => {
        const pollRef = ref(database, `groups/${groupId}/messages/${pollId}`);
        const pollSnapshot = await get(pollRef);
        const poll = pollSnapshot.val();

        if (poll && poll.options[0] === 'Yes' && countVotes(poll.votes, 0) > countVotes(poll.votes, 1)) {
            // Start creator election
            const electionData = {
                type: 'election',
                candidates: Object.keys(groupMembers).filter(id => id !== Object.keys(groupMembers).find(key => groupMembers[key].role === 'creator')),
                votes: {},
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            };

            const messagesRef = ref(database, `groups/${groupId}/messages`);
            await push(messagesRef, electionData);
        }
    };

    const handleElectionEnd = async (electionId) => {
        const electionRef = ref(database, `groups/${groupId}/messages/${electionId}`);
        const electionSnapshot = await get(electionRef);
        const election = electionSnapshot.val();

        const voteCounts = election.candidates.map(candidate => ({
            candidate,
            votes: countVotes(election.votes, election.candidates.indexOf(candidate)),
        }));

        voteCounts.sort((a, b) => b.votes - a.votes);

        if (voteCounts[0].votes > 0) {
            const newCreatorId = voteCounts[0].candidate;
            const groupRef = ref(database, `groups/${groupId}`);
            
            // Update roles
            const updates = {};
            Object.keys(groupMembers).forEach(memberId => {
                updates[`members/${memberId}/role`] = memberId === newCreatorId ? 'creator' : 'member';
            });

            await update(groupRef, updates);
        }
    };

    const countVotes = (votes, optionIndex) => {
        return Object.values(votes).filter(vote => vote === optionIndex).length;
    };

    const renderItem = ({ item }) => (
        <View>
            <ChatDateSeparator date={item.date} />
            {item.messages.map((message, index) => {
                if (message.type === 'poll' || message.type === 'election') {
                    console.log('Rendering PollItem:', message); // Debugging output
                    return (
                        <PollItem
                            key={message.id}
                            poll={message} // Pass the entire message object as poll
                            groupId={groupId}
                            onVote={(optionIndex) => handleVote(message.id, optionIndex)}
                            onPollEnd={() => message.type === 'poll' ? handlePollEnd(message.id) : handleElectionEnd(message.id)}
                        />
                    );
                }
                return (
                    <ChatItem
                        key={message.id}
                        message={message}
                        showSenderName={index === 0 || item.messages[index - 1].senderId !== message.senderId}
                        isLastInGroup={index === item.messages.length - 1 || item.messages[index + 1].senderId !== message.senderId}
                    />
                );
            })}
        </View>
    );

    return (
        <FlatList
            ref={flatListRef}
            data={groupMessagesByDate()}
            renderItem={renderItem}
            keyExtractor={(item) => item.date}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
    );
};

export default MessageList;
