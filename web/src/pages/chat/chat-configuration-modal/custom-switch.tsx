import classNames from 'classnames';
import React from 'react';
import styles from './custom-switch.less';

interface CustomSwitchProps {
  value?: boolean; // 改为value，适配Form.Item
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'default' | 'small';
  className?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value, // Form.Item传递的值
  checked,
  onChange,
  disabled = false,
  size = 'default',
  className,
}) => {
  // 优先使用value（来自Form.Item），其次使用checked
  const isChecked = value !== undefined ? value : checked || false;

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!isChecked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onChange) {
      e.preventDefault();
      onChange(!isChecked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      className={classNames(
        styles.customSwitch,
        {
          [styles.checked]: isChecked,
          [styles.disabled]: disabled,
          [styles.small]: size === 'small',
        },
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      <span className={styles.thumb} />
      <span className={styles.track} />
    </button>
  );
};

export default CustomSwitch;
