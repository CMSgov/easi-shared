import React, { useReducer, useState } from 'react';

export enum ActionTypes {
  SELECT_OPTION,
  CLEAR,
  OPEN_LIST,
  CLOSE_LIST,
  FOCUS_OPTION,
  UPDATE_RESULTS,
  BLUR,
  CLEAR_SELECTION,
  FOCUS_INPUT
}

export type Action =
  | {
      type: ActionTypes.SELECT_OPTION;
      option: MultiSelectOption;
    }
  | {
      type: ActionTypes.CLEAR;
    }
  | {
      type: ActionTypes.OPEN_LIST;
    }
  | {
      type: ActionTypes.CLOSE_LIST;
    }
  | {
      type: ActionTypes.FOCUS_OPTION;
      option: MultiSelectOption;
    }
  | {
      type: ActionTypes.UPDATE_RESULTS;
      value: string;
    }
  | {
      type: ActionTypes.BLUR;
    }
  | {
      type: ActionTypes.CLEAR_SELECTION;
    }
  | {
      type: ActionTypes.FOCUS_INPUT;
    };

export type MultiSelectOption = {
  value: string;
  label: string;
};

export type MultiSelectState = {
  isOpen: boolean;
  selectedOptions: MultiSelectOption[];
  focusedOption?: MultiSelectOption;
  options: MultiSelectOption[];
  searchValue: string;
  // statusText: string;
};

export function useMultiSelect(
  initialState: MultiSelectState,
  options: MultiSelectOption[]
) {
  const filterSearchResults = (value: string) => {
    const searchIndex = (option: string) => {
      return option.toLowerCase().search(value);
    };
    return options
      .filter(option => searchIndex(option.label) > -1)
      .sort((a, b) => searchIndex(a.label) - searchIndex(b.label));
  };
  const reducer = (state: MultiSelectState, action: Action) => {
    switch (action.type) {
      case ActionTypes.SELECT_OPTION: {
        console.log(action.option);
        const isSelected = state.selectedOptions.some(
          selectedOption => selectedOption.value === action.option.value
        );
        return {
          ...state,
          selectedOptions: isSelected
            ? state.selectedOptions.filter(
                option => option.value !== action.option.value
              )
            : ([
                ...state.selectedOptions,
                state.options.find(
                  option => option.value === action.option.value
                )
              ] as MultiSelectOption[])
        };
      }
      case ActionTypes.CLEAR: {
        return {
          ...state,
          searchValue: '',
          isOpen: false
        };
      }
      case ActionTypes.OPEN_LIST: {
        return {
          ...state,
          isOpen: true
        };
      }
      case ActionTypes.CLOSE_LIST: {
        return {
          ...state,
          isOpen: false,
          searchValue: ''
        };
      }
      case ActionTypes.UPDATE_RESULTS: {
        return {
          ...state,
          searchValue: action.value,
          options: filterSearchResults(action.value)
        };
      }
      case ActionTypes.BLUR: {
        return {
          ...state,
          isOpen: false,
          searchValue: ''
        };
      }
      case ActionTypes.CLEAR_SELECTION: {
        return {
          ...state,
          isOpen: false,
          searchValue: '',
          selectedOptions: []
        };
      }
      // case ActionTypes.FOCUS_INPUT: {
      //   return state;
      // }
      default:
        throw new Error();
    }
  };
  return useReducer(reducer, initialState);
}
