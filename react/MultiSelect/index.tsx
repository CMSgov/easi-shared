import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox
} from '@trussworks/react-uswds';
import classNames from 'classnames';

import {
  Action,
  ActionTypes,
  MultiSelectOption,
  MultiSelectState,
  useMultiSelect
} from './useMultiSelect';

import './index.scss';

type OptionType = {
  label: string;
  value: string;
};

const Options = ({
  state,
  dispatch
}: {
  state: MultiSelectState;
  dispatch: React.Dispatch<Action>;
}) => {
  const { t } = useTranslation();
  return (
    <>
      {state.options.length > 0 ? (
        state.options.map((option, index) => {
          const isSelected = state.selectedOptions.some(
            selectedOption => selectedOption.value === option.value
          );
          return (
            <Checkbox
              value={option.value}
              key={option.value}
              className={classNames(
                'usa-combo-box__list-option',
                'hover:bg-base-lightest',
                {
                  // 'usa-combo-box__list-option--focused': focused,
                  'usa-combo-box__list-option--selected': isSelected
                }
              )}
              role="option"
              aria-selected={isSelected}
              aria-setsize={state.options.length}
              aria-posinset={index + 1}
              id={`easi-multiselect__option-${option.value}`}
              name={`easiMultiselectOption${option.value}`}
              onClick={() =>
                dispatch({
                  type: ActionTypes.SELECT_OPTION,
                  option
                })
              }
              onKeyDown={() => console.log('keydown')} // TODO: Fix
              onBlur={() => dispatch({ type: ActionTypes.BLUR })} // TODO: Fix
              data-testid={`easi-multiselect__option-${option.value}`}
              data-value={option.value}
              label={t(option.label)}
              defaultChecked={isSelected}
            />
          );
        })
      ) : (
        <span className="padding-1">{t('No results')}</span>
      )}
    </>
  );
};

type MultiSelectProps = {
  className?: string;
  id: string;
  name: string;
  options: OptionType[];
  selectedLabel?: string;
  onChange: (value: MultiSelectOption[]) => void;
  initialValues?: string[];
  disabled?: boolean;
};

export default function MultiSelect({
  className,
  id,
  name,
  options,
  selectedLabel = 'Selected options',
  onChange,
  initialValues = [],
  disabled
}: MultiSelectProps) {
  const initialState: MultiSelectState = useMemo(
    () => ({
      isOpen: false,
      options,
      selectedOptions: options.filter(option =>
        initialValues.includes(option.value)
      ),
      searchValue: ''
    }),
    [options, initialValues]
  );
  const [state, dispatch] = useMultiSelect(initialState, options);

  const { t } = useTranslation();
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        dispatch({ type: ActionTypes.CLOSE_LIST });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  useEffect(() => {
    onChange(state.selectedOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedOptions]);

  return (
    <div
      className={classNames('usa-combobox', 'position-relative', {
        'usa-combo-box--pristine': state.searchValue
      })}
      ref={containerRef}
    >
      <select
        className="usa-select usa-sr-only usa-combo-box__select"
        name={name}
        aria-hidden
        tabIndex={-1}
        defaultValue={initialValues}
        multiple
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        className="usa-combo-box__input"
        onChange={e =>
          dispatch({ type: ActionTypes.UPDATE_RESULTS, value: e.target.value })
        }
        onClick={() => dispatch({ type: ActionTypes.OPEN_LIST })}
        onBlur={() => console.log('input blur')}
        // onKeyDown={}
        value={state.searchValue}
        placeholder={t(`${state.selectedOptions.length} selected`)}
        id={id}
        disabled={disabled}
      />
      <span className="usa-combo-box__clear-input__wrapper" tabIndex={-1}>
        <button
          type="button"
          className="usa-combo-box__clear-input"
          aria-label="Clear the search value"
          onClick={(): void => dispatch({ type: ActionTypes.CLEAR })}
          data-testid="combo-box-clear-button"
          onKeyDown={() => null}
          hidden={!state.searchValue}
          disabled={disabled}
        >
          &nbsp;
        </button>
      </span>
      <span className="usa-combo-box__input-button-separator">&nbsp;</span>
      <span className="usa-combo-box__toggle-list__wrapper" tabIndex={-1}>
        <button
          data-testid="combo-box-toggle"
          type="button"
          className="usa-combo-box__toggle-list"
          tabIndex={-1}
          aria-label="Toggle the dropdown list"
          onClick={(): void =>
            dispatch({
              type: state.isOpen
                ? ActionTypes.CLOSE_LIST
                : ActionTypes.OPEN_LIST
            })
          }
          disabled={disabled}
        >
          &nbsp;
        </button>
      </span>
      <div
        data-testid="combo-box-option-list"
        tabIndex={-1}
        className="usa-combo-box__list"
        role="listbox"
        hidden={!state.isOpen}
      >
        <Options state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
