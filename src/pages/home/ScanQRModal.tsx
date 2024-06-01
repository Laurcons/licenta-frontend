import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { TicketUtil } from '../../lib/ticket.util';
import { localdb } from '../../lib/dexie/dexie';
import dayjs from 'dayjs';
import { useLanguage } from '../../lib/language';

export default function ScanQRModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
  // onScan?: (data: { trainNum: string; destinationId: string }) => void;
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  function decodeQrCode(rawCode: string) {
    try {
      const ticketData = TicketUtil.decodeQrCode(rawCode);
      // create a trip
      // we create it here in order to have a change to add the ticket data
      const userTripIdP = localdb.userTrips.add({
        date: dayjs().format('YYYY-MM-DD'),
        trackStartedAt: new Date(),
        trainNum: ticketData.trainNum,
        destinationId: ticketData.destinationId,
        ticketDecodedInfo: ticketData,
      });
      // redirect to track page
      setTimeout(async () => {
        const userTripId = await userTripIdP;
        // settimeout to let the beep sound
        navigate({
          pathname: `/track/${ticketData.trainNum}`,
          search: `destinationId=${ticketData.destinationId}&userTripId=${userTripId}`,
        });
      }, 500);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Unknown error occurred: ' + err);
      }
    }
  }

  return (
    <>
      <Modal show={isOpen} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('home.scan.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Scanner
            onResult={(code) => decodeQrCode(code)}
            onError={(err) => alert(err.message)}
            components={{ tracker: true }}
          ></Scanner>
        </Modal.Body>
      </Modal>
    </>
  );
}
