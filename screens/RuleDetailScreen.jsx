import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, useWindowDimensions } from 'react-native';
import { ref, push, update, remove, onValue } from 'firebase/database';
import { database } from '../firebase';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PointsDial from '../components/PointsDial'; // Make sure to import PointsDial

const SWIPE_THRESHOLD = 80;

const SwipeableRuleItem = ({ item, onEdit, onDelete, isBottomSheetVisible }) => {
  const translateX = useSharedValue(0);

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
  }, [translateX]);

  useEffect(() => {
    if (!isBottomSheetVisible) {
      resetPosition();
    }
  }, [isBottomSheetVisible, resetPosition]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: () => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onEdit)(item);
      } else if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(onDelete)(item);
      }
      runOnJS(resetPosition)();
    },
  });

  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(1, -translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(1, translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  return (
    <View className="relative mb-2">
      <Animated.View className="absolute top-0 bottom-0 left-0 w-full justify-center pr-4 items-end bg-blue-500 rounded-xl" style={leftActionStyle}>
        <Ionicons name="pencil" size={24} color="white" />
      </Animated.View>
      <Animated.View className="absolute top-0 bottom-0 right-0 w-full justify-center pl-4 items-start bg-red-500 rounded-xl" style={rightActionStyle}>
        <Ionicons name="trash" size={24} color="white" />
      </Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View className="bg-zinc-800 px-5 py-6 rounded-xl flex-row justify-between items-center" style={ruleStyle}>
          <Text className="text-white text-lg">{item.ruleName}</Text>
          <Text className="text-gray-400 text-base">{item.points} points</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};


const RuleDetailScreen = ({ route, navigation }) => {
  const { group } = route.params;
  const [rules, setRules] = useState([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePoints, setNewRulePoints] = useState(0);
  const [editingRule, setEditingRule] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isSmallDevice = height < 700;
  const isTallDevice = height > 800;

  useEffect(() => {
    const rulesRef = ref(database, `groups/${group.id}/rules`);
    const unsubscribe = onValue(rulesRef, (snapshot) => {
      const rulesData = snapshot.val() || {};
      const rulesList = Object.entries(rulesData).map(([ruleId, rule]) => ({
        id: ruleId,
        ...rule,
      }));
      setRules(rulesList);
    });

    return () => unsubscribe();
  }, [group.id]);

  const handleAddRule = useCallback(() => {
    if (newRuleName.trim()) {
      const rulesRef = ref(database, `groups/${group.id}/rules`);
      push(rulesRef, {
        ruleName: newRuleName.trim(),
        points: newRulePoints,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setNewRuleName('');
      setNewRulePoints(0);
      setIsBottomSheetVisible(false);
      bottomSheetRef.current?.close();
      Keyboard.dismiss();
    }
  }, [group.id, newRuleName, newRulePoints]);

  const handleEditRule = useCallback((rule) => {
    setEditingRule(rule);
    setNewRuleName(rule.ruleName);
    setNewRulePoints(rule.points);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleUpdateRule = useCallback(() => {
    if (editingRule && newRuleName.trim()) {
      const ruleRef = ref(database, `groups/${group.id}/rules/${editingRule.id}`);
      update(ruleRef, {
        ruleName: newRuleName.trim(),
        points: newRulePoints,
        updatedAt: Date.now(),
      });
      setEditingRule(null);
      setNewRuleName('');
      setNewRulePoints(0);
      setIsBottomSheetVisible(false);
      bottomSheetRef.current?.close();
      Keyboard.dismiss();
    }
  }, [group.id, editingRule, newRuleName, newRulePoints]);

  const handleDeleteRule = useCallback((rule) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const ruleRef = ref(database, `groups/${group.id}/rules/${rule.id}`);
            remove(ruleRef);
          },
        },
      ]
    );
  }, [group.id]);

  const handlePointsChange = useCallback((points) => {
    setNewRulePoints(points);
  }, []);

  const onClose = useCallback(()=>{
      bottomSheetRef.current?.close();
      setIsBottomSheetVisible(false);
      Keyboard.dismiss();
    
  }, []);

  return (
    <View className="flex-1 bg-[#0D0F15] p-4" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">{group.groupName} Rules</Text>
      </View>

      <View className="mt-1 py-3">
        {rules.map((rule) => (
          <SwipeableRuleItem
            key={rule.id}
            item={rule}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
            isBottomSheetVisible={isBottomSheetVisible}
          />
        ))}
      </View>

      <TouchableOpacity
        className={`absolute right-5 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-md ${
          isSmallDevice ? 'bottom-5' : isTallDevice ? 'bottom-14' : 'bottom-10'
        }`}
        style={{ bottom: insets.bottom + (isSmallDevice ? 20 : isTallDevice ? 14 : 10) }}
        onPress={() => {
          setEditingRule(null);
          setNewRuleName('');
          setNewRulePoints(0);
          setIsBottomSheetVisible(true);
          bottomSheetRef.current?.expand();
        }}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['90%']}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: '#18181b',
        }}
        handleIndicatorStyle={{
          width: 50,
          height: 5,
          backgroundColor: '#71717a',
        }}
        onClose={() => {
          setIsBottomSheetVisible(false);
          Keyboard.dismiss();
        }}
      >
        <View className="flex-1 p-4">
          
          <View className="flex-row justify-between items-center w-full px-2 -mt-4 mb-6">
            <Text className="text-[20px] text-white">Set Points</Text>
            <TouchableOpacity className="bg-[#3f3f46] rounded-full p-[4px]" onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="bg-zinc-800 text-white rounded-lg p-3 mb-0"
            placeholder="Rule name"
            value={newRuleName}
            onChangeText={setNewRuleName}
            placeholderTextColor="#a1a1aa"
          />
          
          <PointsDial
            initialPoints={newRulePoints}
            onPointsChange={handlePointsChange}
            onClose={() => bottomSheetRef.current?.close()}
            allowNegative={true} // Allow positive and negative values
            minPoints={-1000}
            maxPoints={1000}
          />

          <TouchableOpacity
            className="bg-mainPrimary rounded-lg p-3 items-center mt-2"
            onPress={editingRule ? handleUpdateRule : handleAddRule}
          >
            <Text className="text-white font-bold">
              {editingRule ? 'Update Rule' : 'Add Rule'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default RuleDetailScreen;