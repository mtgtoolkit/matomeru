import { useState } from 'react'
import { useT } from '../hooks/useT'
import { Button, Modal, QuantityStepper } from './primitives'
import CopyPicker from './CopyPicker'

/**
 * Which of your copies goes into a deck slot the decklist is still asking for.
 *
 * Two questions, both of which only make sense one card at a time: which copy, and how
 * many. The copy list spans printings, because the whole point is that the card you
 * physically own is often not the one Archidekt named — a French copy fills an English
 * slot, and the deck then records what you actually sleeved.
 *
 * Nothing is preselected. Confirming puts a specific physical card into a deck, and the
 * rows differ only by their set, number and language chips; picking the wrong one is a
 * thing you would then have to undo. The same reasoning `AddToListDialog` gives for not
 * preselecting a list, applied to something less reversible.
 */
export default function FillSlotDialog({
  scryfallId,
  cardName,
  slots,
  onCancel,
  onConfirm
}: {
  /** The entry's resolved printing; the copy list scopes to its card from here. */
  scryfallId: string
  cardName: string
  /** Copies the decklist still asks for: the entry's quantity less what the deck holds. */
  slots: number
  onCancel: () => void
  onConfirm: (collectionItemId: number, quantity: number) => void
}): React.ReactElement {
  const t = useT()
  const [copyId, setCopyId] = useState<number | null>(null)
  /** What the chosen copy can supply, which caps the stepper along with the slot count. */
  const [copyFree, setCopyFree] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const max = Math.max(1, Math.min(copyFree || slots, slots))

  return (
    <Modal open onClose={onCancel} title={t('decks.fillTitle')} width="max-w-md">
      <div className="px-5 py-4">
        <p className="mb-3 text-[11px] leading-relaxed text-ink-500">{t('decks.fillHint')}</p>

        <div className="mb-4 flex items-center gap-2.5 text-[11px] text-ink-400">
          {t('decks.fillHowMany')}
          <QuantityStepper
            value={quantity}
            min={1}
            max={max}
            size="sm"
            onChange={setQuantity}
          />
          <span className="text-ink-500">{t('decks.fillSlots', { count: slots })}</span>
        </div>

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          {t('copies.title')}
        </p>
        <CopyPicker
          scryfallId={scryfallId}
          selected={copyId}
          needed={quantity}
          onChoose={(copy) => {
            setCopyId(copy.collection_item_id)
            const free = copy.quantity - copy.reserved
            setCopyFree(free)
            // Never leave the stepper above what the copy just chosen can give.
            setQuantity((current) => Math.min(current, Math.max(1, Math.min(free, slots))))
          }}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={copyId === null}
            onClick={() => copyId !== null && onConfirm(copyId, Math.min(quantity, max))}
            data-action="confirmFillSlot"
            title={cardName}
          >
            {t('decks.fillConfirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
