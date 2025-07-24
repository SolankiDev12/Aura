import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const MemberItem = React.memo(({ item, onSelect, isCreator, currentUserId, groupCreatorId, groupIcon }) => {
  const ItemContent = (
    <View style={[styles.flatContainer]}>
      <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
        <Image
          source={require('../assets/profile/default_profile.png')}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
        <View>
          <Text style={{ color: 'white', fontSize: 18 }}>{item.name}</Text>
          {item.uid === groupCreatorId && <Text style={{ color: '#00BFFF', fontSize: 12 }}>Aurator</Text>}
        </View>
      </View>
      <View style={[styles.pointContainer]}>
            <Text style={styles.pointsText}>{item.points}</Text>
            </View>
    </View>
  );

  return (
    <TouchableOpacity onPress={onSelect} disabled={!isCreator}>
      {ItemContent}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({

  pointContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2354E9',
    height: 60,
    width: 100,
    borderRadius: 50,
  },

  flatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#292C35',
    borderRadius: 50,
    width: '100%',
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  nameText: {
    color: 'white',
    fontSize: 18,
  },
  creatorText: {
    color: '#00BFFF',
    fontSize: 14,
  },
  pointsText: {
    color: 'white',
    fontSize: 18,
  },
});

export default MemberItem;
