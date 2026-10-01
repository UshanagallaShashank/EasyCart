// The business address section: street, optional landmark, then city / state / PIN code side by side.
import { useId } from 'react';
import { MapPin } from 'lucide-react';
import { INDIAN_STATES, cleanPincode, type BusinessAddress } from '../lib/business-address';

interface BusinessAddressFieldsProps {
  value: BusinessAddress;
  onChange: (address: BusinessAddress) => void;
}

const INPUT_CLASS =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:outline-none';
const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-slate-700';

export function BusinessAddressFields({ value, onChange }: BusinessAddressFieldsProps) {
  const ids = { line1: useId(), landmark: useId(), city: useId(), state: useId(), pincode: useId() };

  function update(field: keyof BusinessAddress, text: string) {
    onChange({ ...value, [field]: text });
  }

  return (
    <fieldset className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <legend className="-ml-1 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
        <MapPin className="size-3.5 text-sky-500" /> Business address <span className="text-rose-500">*</span>
      </legend>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={ids.line1} className={LABEL_CLASS}>Shop / building and street</label>
        <input
          id={ids.line1}
          type="text"
          required
          autoComplete="address-line1"
          value={value.line1}
          onChange={(e) => update('line1', e.target.value)}
          placeholder="e.g. Shop 12, Market Road"
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={ids.landmark} className={LABEL_CLASS}>
          Landmark <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
        </label>
        <input
          id={ids.landmark}
          type="text"
          autoComplete="off"
          value={value.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          placeholder="e.g. Near City Mall"
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-6">
        <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={ids.city} className={LABEL_CLASS}>City</label>
          <input
            id={ids.city}
            type="text"
            required
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Hyderabad"
            className={INPUT_CLASS}
          />
        </div>

        <div className="col-span-1 flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={ids.state} className={LABEL_CLASS}>State</label>
          <select
            id={ids.state}
            required
            autoComplete="address-level1"
            value={value.state}
            onChange={(e) => update('state', e.target.value)}
            className={`${INPUT_CLASS} ${value.state ? '' : 'text-slate-400'}`}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state} className="text-slate-900">{state}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={ids.pincode} className={LABEL_CLASS}>PIN code</label>
          <input
            id={ids.pincode}
            type="text"
            inputMode="numeric"
            required
            autoComplete="postal-code"
            maxLength={6}
            value={value.pincode}
            onChange={(e) => update('pincode', cleanPincode(e.target.value))}
            placeholder="500001"
            className={`${INPUT_CLASS} tabular-nums`}
          />
        </div>
      </div>
    </fieldset>
  );
}
