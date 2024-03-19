import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import Icons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { COLORS, FONT } from "../Constants";
import { convertToReadableDate } from "../Utils/Utils";
import SubmitButton from "./SubmitButton";

const DropDownFilter = ({
  isShowCalender,
  date,
  resetHandler,
  zoneData,
  zoneItem,
  selectZoneItem,
  submitHandler,
  isDateVisible = false,
  forProject = false,
}: any) => {
  const { language } = useSelector((state: any) => state.Preference);
  const [dropDownIcon, setDropDownIcon] = useState<boolean>(false);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isDateVisible && (
        <React.Fragment>
          <Text style={[styles.title]}>{language?.selectDate}</Text>
          <TouchableOpacity
            onPress={isShowCalender}
            activeOpacity={0.7}
            style={styles.dropDownButton}
          >
            <Text
              style={[
                styles.filterText,
                { textAlign: "center", width: date?.length },
              ]}
            >
              {date ? convertToReadableDate(date) : language?.selectDate}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      )}

      <View style={styles.buttonTitle}>
        <Text
          style={[
            styles.filterText,
            {
              marginTop: 20,
              fontFamily: FONT.notoSansBold,
            },
          ]}
        >
          {language?.selectOption}
        </Text>
        <TouchableOpacity onPress={resetHandler}>
          <Text
            style={[
              styles.filterText,
              {
                color: COLORS.primary,
                marginTop: 20,
                fontFamily: FONT.notoSansBold,
                paddingHorizontal: 5,
              },
            ]}
          >
            {language?.reset}
          </Text>
        </TouchableOpacity>
      </View>

      <SelectDropdown
        data={zoneData}
        defaultValue={forProject ? zoneItem?.pk : zoneItem?.zone_id}
        rowTextForSelection={(item, index) => {
          setDropDownIcon(true);
          return forProject ? item?.name : item?.zone_code;
        }}
        defaultButtonText={
          forProject && zoneItem?.name
            ? zoneItem?.name
            : zoneItem?.zone_code
            ? zoneItem?.zone_code
            : language?.selectOption
        }
        buttonTextAfterSelection={() => {
          setDropDownIcon(false);
          return forProject && zoneItem?.name
            ? zoneItem?.name
            : zoneItem?.zone_code
            ? zoneItem?.zone_code
            : language?.selectOption;
        }}
        onSelect={(selectedItem, index) => {
          selectZoneItem(selectedItem);
        }}
        buttonStyle={[styles.dropDownButton, { width: "100%" }]}
        buttonTextStyle={styles.filterText}
        rowTextStyle={styles.filterText}
        selectedRowTextStyle={styles.filterText}
        renderDropdownIcon={() => (
          <Icons
            name={dropDownIcon ? "caret-up-outline" : "caret-down-outline"}
            color={COLORS.solidBlack}
            size={20}
          />
        )}
      />

      <View
        style={[
          styles.buttonContainer,
          { marginTop: !isDateVisible ? 150 : 50 },
        ]}
      >
        <SubmitButton
          title={language?.apply}
          handleSubmitButton={submitHandler}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.solidBlack,
    fontSize: 16,
    marginTop: 30,
    fontFamily: FONT.notoSansBold,
  },
  filterText: {
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
    fontSize: 16,
  },
  buttonTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropDownButton: {
    backgroundColor: COLORS.grayWhite,
    borderWidth: 0.5,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    elevation: 1,
    shadowColor: COLORS.grayWhite,
    borderColor: COLORS.grayWhite,
    padding: 7,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    paddingVertical: 10,
  },
  buttonContainer: {
    alignItems: "center",
    margin: 20,
  },
});

export default DropDownFilter;
