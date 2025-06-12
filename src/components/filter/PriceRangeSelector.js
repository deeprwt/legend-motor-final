import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Keyboard,
} from 'react-native';
import Slider from './Slider';
import {useTheme} from '../../context/ThemeContext';
import {COLORS} from 'src/utils/constants';
import RangePicker from './RangePicker';

const PriceRangeSelector = ({onSelectItem}) => {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(700);
  const [minInput, setMinInput] = useState(0);
  const [maxInput, setMaxInput] = useState(700);
  const {isDark} = useTheme();

  const handleMinInputChange = text => {
    // Remove any non-numeric characters and $ and K
    const numericValue = text.replace(/[^0-9]/g, '');
    setMinInput(numericValue);

    const newValue = parseInt(numericValue) || 0;
    // Ensure value is between 0 and maxValue
    const clampedValue = Math.min(Math.max(0, newValue), maxValue);
    setMinValue(clampedValue);
    onSelectItem({min: clampedValue, max: maxValue});
  };

  const handleMaxInputChange = text => {
    // Remove any non-numeric characters and $ and K
    const numericValue = text.replace(/[^0-9]/g, '');
    setMaxInput(numericValue);

    const newValue = parseInt(numericValue) || 0;
    // Ensure value is between minValue and 700
    const clampedValue = Math.min(Math.max(minValue, newValue), 700);
    setMaxValue(clampedValue);
    onSelectItem({min: minValue, max: clampedValue});
  };

  const handleMinBlur = () => {
    // Ensure the displayed value matches the actual minValue
    setMinInput(minValue.toString());
  };

  const handleMaxBlur = () => {
    // Ensure the displayed value matches the actual maxValue
    setMaxInput(maxValue.toString());
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Price Range Display */}
      <View style={[styles.rangeBox, isDark && styles.rangeBoxDark]}>
        <Text style={[styles.label, isDark && styles.labelDark]}>
          Price Range
        </Text>
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputContainer,
              {backgroundColor: isDark ? '#3D3D3D' : '#FCEED4'},
            ]}>
            <Text
              style={[
                styles.currencySymbol,
                {color: isDark ? '#FFFFFF' : '#333333'},
              ]}>
              $
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={minInput}
              onChangeText={handleMinInputChange}
              onBlur={handleMinBlur}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              maxLength={4}
            />
            <Text
              style={[
                styles.unitSymbol,
                {color: isDark ? '#FFFFFF' : '#333333'},
              ]}>
              K
            </Text>
          </View>
          <Text style={[styles.to, isDark && styles.toDark]}> - </Text>
          <View
            style={[
              styles.inputContainer,
              {backgroundColor: isDark ? '#3D3D3D' : '#FCEED4'},
            ]}>
            <Text
              style={[
                styles.currencySymbol,
                {color: isDark ? '#FFFFFF' : '#333333'},
              ]}>
              $
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={maxInput}
              onChangeText={handleMaxInputChange}
              onBlur={handleMaxBlur}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              maxLength={4}
            />
            <Text
              style={[
                styles.unitSymbol,
                {color: isDark ? '#FFFFFF' : '#333333'},
              ]}>
              K
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.sliderContainer, isDark && styles.sliderContainerDark]}>
        <View style={styles.sliderWrapper}>
          {/* <Slider
            min={0}
            max={700}
            currentMin={minValue}
            currentMax={maxValue}
            onChange={({min, max}) => {
              setMinValue(min);
              setMaxValue(max);
              setMinInput(min.toString());
              setMaxInput(max.toString());
              onSelectItem({min, max});
            }}
          /> */}
          <RangePicker
            min={0}
            max={700}
            currentMin={minValue}
            currentMax={maxValue}
            onChange={({min, max}) => {
              setMinValue(min);
              setMaxValue(max);
              setMinInput(min.toString());
              setMaxInput(max.toString());
              onSelectItem({min, max});
            }}
          />
        </View>
      </View>
    </View>
  );
};

const {height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#2D2D2D',
  },
  rangeBox: {
    padding: 10,
    marginBottom: 20,
    width: 220,
  },
  rangeBoxDark: {
    backgroundColor: '#2D2D2D',
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333333',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEED4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE3D8',
  },
  input: {
    padding: 10,
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333333',
  },
  inputDark: {
    backgroundColor: '#3D3D3D',
    borderColor: '#4D4D4D',
    color: '#FFFFFF',
  },
  currencySymbol: {
    paddingLeft: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  unitSymbol: {
    paddingRight: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  to: {
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  toDark: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    alignItems: 'center',
    height: height * 0.5,
    justifyContent: 'space-between',
  },
  sliderContainerDark: {
    backgroundColor: '#2D2D2D',
  },
  sliderWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  priceLabel: {
    fontWeight: '600',
    marginVertical: 10,
  },
  sliderValueTop: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderValueBottom: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginTop: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  rail: {
    backgroundColor: '#ccc',
    height: 5,
  },
  railSelected: {
    backgroundColor: COLORS.primary,
    height: 5,
  },
  label1: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
  },
  slider: {
    width: 270,
    height: 20,
  },
});
export default PriceRangeSelector;
