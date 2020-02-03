import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function STAM() {
  return (
    <View style={styles.container}>
      <Text>heyy</Text>
      <Button title="click me">hey</Button>
      {/* <Button title="click me">hey</Button> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
