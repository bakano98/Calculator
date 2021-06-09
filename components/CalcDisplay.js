import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class CalcDisplay extends React.Component {
  render() {
    return(
      <View style={styles.container}>
        <Text style={styles.display}> {this.props.display} </Text>  
      </View>
    );
  }  
}

const styles = StyleSheet.create({
  container: {},
  display: { fontSize: 70, fontWeight: "bold", color: "white", textAlign: "right"},
});

CalcDisplay.defaultProps = {
  display: "0",
}