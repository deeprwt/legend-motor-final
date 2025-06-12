import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import RangeSlider from 'rn-range-slider';

const RangePicker = ({min, max, currentMin, currentMax, onChange}) => {
  const handleValueChange = useCallback((low, high) => {
    onChange({min: low, max: high});
  }, []);

  // Render components
  const Thumb = ({name}) => {
    return (
      <View
        style={[
          styles.thumb,
          // {
          //   marginLeft: name === 'low' ? -20 : 0,
          //   marginRight: name === 'high' ? -20 : 0,
          // },
        ]}
      />
    );
  };
  const Rail = () => <View style={styles.rail} />;
  const RailSelected = () => <View style={styles.railSelected} />;
  const Notch = () => <View style={styles.notch} />;
  const Label = ({text}) => (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{text}</Text>
    </View>
  );

  return (
    <View
      style={[styles.container, {width: Dimensions.get('window').width * 0.5}]}>
      <RangeSlider
        style={styles.slider}
        min={0}
        max={700}
        step={1}
        low={currentMin}
        high={currentMax}
        floatingLabel
        renderThumb={name => <Thumb name={name} />}
        renderRail={Rail}
        renderRailSelected={RailSelected}
        renderLabel={value => <Label text={`${value.toLocaleString()}K`} />}
        renderNotch={Notch}
        onValueChanged={handleValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  slider: {
    height: 80,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF9439',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  rail: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d3d3d3',
  },
  railSelected: {
    height: 4,
    backgroundColor: '#EF9439',
    borderRadius: 2,
  },
  notch: {
    width: 8,
    height: 8,
    backgroundColor: '#EF9439',
    transform: [{rotate: '45deg'}],
    marginTop: -4,
  },
  labelContainer: {
    alignItems: 'center',
    padding: 4,
    backgroundColor: '#EF9439',
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default RangePicker;
