/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { Spot } from '../spots/entities/spot.entity';
import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReserveSpotDto } from './dto/reserve-spot.dto';
import { PrismaService } from '@app/core/prisma/prisma.service';
import { SpotStatus, TicketStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { promises } from 'dns';

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}
  create(createEventDto: CreateEventDto) {
    return this.prismaService.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
      },
    });
  }

  findAll() {
    return this.prismaService.event.findMany();
  }

  findOne(id: string) {
    return this.prismaService.event.findFirst({ where: { id: id } });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.prismaService.event.update({
      data: {
        ...updateEventDto,
        date: new Date(updateEventDto.date),
      },
      where: { id: id },
    });
  }

  remove(id: string) {
    return this.prismaService.event.delete({
      where: { id: id },
    });
  }
  async reserveSpot(dto: ReserveSpotDto & { eventId: string }) {
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: dto.eventId,
        name: {
          in: dto.spots,
        },
      },
    });
    if (spots.length !== dto.spots.length) {
      const foundSpotsName = spots.map((spot) => spot.name);
      const notFoundSpots = dto.spots.filter(
        (spotName) => !foundSpotsName.includes(spotName),
      );
      throw new Error(`Spots ${notFoundSpots.join(', ')} not found`);
    }
    try {
      const tickets = await this.prismaService.$transaction(
        async (prisma) => {
          prisma.reservationHistory.createMany({
            data: spots.map((spot) => ({
              spotId: spot.id,
              ticketKind: dto.ticket_kind,
              email: dto.email,
              status: TicketStatus.reserved,
            })),
          });
          prisma.spot.updateMany({
            where: {
              id: {
                in: spots.map((spot) => spot.id),
              },
            },
            data: {
              status: SpotStatus.reserved,
            },
          });

          const tickets = await Promise.all(
            spots.map((spot) =>
              prisma.ticket.create({
                data: {
                  spotId: spot.id,
                  ticketKind: dto.ticket_kind,
                  email: dto.email,
                },
              }),
            ),
          );
          return tickets;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted },
      );
      return tickets;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002':
            throw new Error(`Spot alredy reserved`);
          case 'P2034':
            throw new Error(`Spot alredy reserved`);
        }
      }
      throw e;
    }
  }
}
